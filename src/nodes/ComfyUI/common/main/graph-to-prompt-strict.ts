// comfy/graph-to-prompt-strict.ts
export type GuiWorkflow = {
  version?: number; // 0.4 or 1.0
  nodes: GuiNode[];
  links?: any[]; // 0.4: tuple[], 1.0: object[]
};

type GuiNode = {
  id: number | string;
  type: string; // GUIでは "type"、APIでは "class_type"
  inputs?: Array<{
    name: string; // 正式な入力キー名（localized_name は無視）
    link: number | null;
    slot_index?: number | string;
    widget?: { name: string }; // 値を持つなら widget.name が入る
  }>;
  outputs?: Array<{
    name: string; // 出力名（MODEL/CLIP/VAE/IMAGE/LATENT/…）
    slot_index?: number | string;
    links?: number[] | null;
  }>;
  widgets_values?: any[] | Record<string, any>; // UI上の値
};

type ApiPrompt = Record<
  string,
  { class_type: string; inputs: Record<string, any> }
>;

// ---- /object_info 系（最低限の想定型。実物はもう少し情報がある） ----
type ObjectInfoResponse = Record<string, NodeClassInfo>;
type NodeClassInfo = {
  input?: {
    required?: Record<string, InputTypeDecl>;
    optional?: Record<string, InputTypeDecl>;
    // 一部ノード（SaveImage 等）は hidden 入力を持つ
    hidden?: Record<string, InputTypeDecl>;
  };
  output?: Record<string, OutputTypeDecl>;
  // その他: category, name, description, etc...
};

type InputTypeDecl = [string, any?]; // 例: ["INT", {...}] / ["MODEL"]
type OutputTypeDecl = [string, any?]; // 例: ["IMAGE"]

type StrictOptions = {
  baseUrl: string; // 例: http://127.0.0.1:8188
  // 値の型を厳密チェック: true なら入力型に合わないwidgets値はスキップし、未解決なら例外
  strictTypes?: boolean;
  // 必須入力が未指定（リンクも値も無し）の場合にデフォルトを埋める試行（多くのノードはデフォルト不明）
  fillDefaults?: boolean; // デフォルトfalse
};

// Comfyの「リンク型（接続で渡す）」
const LINK_TYPES = new Set([
  "MODEL",
  "CLIP",
  "VAE",
  "IMAGE",
  "LATENT",
  "CONDITIONING",
  "CONTROL_NET",
  "UNET",
  "MASK",
  "UPSCALE_MODEL",
  "LORA_STACK",
  "IPAdapterModel",
  "GLIGEN",
  "AUDIO",
  "ANY",
  "KSamplerSigmas",
]);

// スカラーとして直接渡す型（概ねwidgets_valuesで埋める対象）
const SCALAR_TYPES = new Set([
  "INT",
  "FLOAT",
  "STRING",
  "COMBO",
  "BOOLEAN",
  "FILE",
  "ENUM",
]);

// 拡張: object_info がカンマ区切り列挙(euler,ddim,...)だけを type 名として返すケースを ENUM 相当として扱う
function isScalarType(type: string | undefined): boolean {
  if (!type) return false;
  if (SCALAR_TYPES.has(type)) return true;
  // カンマを含む → 列挙候補群
  if (type.includes(",")) return true;
  return false;
}

function normalizeScalarType(type: string | undefined): string | undefined {
  if (!type) return type;
  if (SCALAR_TYPES.has(type)) return type;
  if (type.includes(",")) return "ENUM"; // 列挙候補を ENUM に正規化
  // 未知型でリンク型でもなさそうな場合は STRING として扱う（例: ckpt_name の型記号など）
  if (!LINK_TYPES.has(type)) return "STRING";
  return type;
}

// ---------- HTTP: /object_info を取ってキャッシュ ----------
class ObjectInfoCache {
  private map?: ObjectInfoResponse;
  private perClass = new Map<string, NodeClassInfo>();
  constructor(private baseUrl: string) {}

  async getAll(): Promise<ObjectInfoResponse> {
    if (!this.map) {
      const res = await fetch(`${this.baseUrl}/object_info`);
      if (!res.ok) throw new Error(`GET /object_info failed: ${res.status}`);
      this.map = await res.json();
      // 一部の環境ではトップレベルに { "nodes": {...} } で返る場合に対応
      if (
        (this.map as any).nodes &&
        typeof (this.map as any).nodes === "object"
      ) {
        this.map = (this.map as any).nodes;
      }
    }
    if (!this.map) {
      throw new Error("Unexpected error: object_info map is undefined");
    }
    return this.map;
  }

  async get(className: string): Promise<NodeClassInfo | undefined> {
    if (this.perClass.has(className)) return this.perClass.get(className);
    const all = await this.getAll();
    const info = all[className];
    if (info) this.perClass.set(className, info);
    return info;
  }

  // 入力定義を (required→optional) の順で配列化（順序はAPI側の列挙順を尊重）
  async listInputs(
    className: string
  ): Promise<Array<{ name: string; type: string }>> {
    const info = await this.get(className);
    const result: Array<{ name: string; type: string }> = [];
    if (!info?.input) return result;
    const pushMap = (m?: Record<string, InputTypeDecl>) => {
      if (!m) return;
      for (const k of Object.keys(m)) {
        const t = Array.isArray(m[k]) ? String(m[k][0]) : "ANY";
        result.push({ name: k, type: t });
      }
    };
    pushMap(info.input.required);
    pushMap(info.input.optional);
    return result;
  }

  async getInputType(
    className: string,
    inputName: string
  ): Promise<string | undefined> {
    const info = await this.get(className);
    const t =
      info?.input?.required?.[inputName] ?? info?.input?.optional?.[inputName];
    return t ? String(t[0]) : undefined;
  }

  async getInputDecl(
    className: string,
    inputName: string
  ): Promise<InputTypeDecl | undefined> {
    const info = await this.get(className);
    return (
      info?.input?.required?.[inputName] ||
      info?.input?.optional?.[inputName] ||
      info?.input?.hidden?.[inputName]
    );
  }
}

// ---------- ユーティリティ ----------
const asId = (v: number | string) => String(v);

// GUIの outputs から (nodeId, slotIndex) -> slotIndex を作る（将来拡張用に保持）
function buildOutputSlotIndex(nodes: GuiNode[]): Map<string, number> {
  const outSlot = new Map<string, number>();
  for (const n of nodes) {
    const nid = asId(n.id);
    for (const o of n.outputs ?? []) {
      const slotIdx = Number(o.slot_index ?? 0);
      const key = `${nid}:${slotIdx}`;
      outSlot.set(key, slotIdx);
    }
  }
  return outSlot;
}

// links を (dstId, dstSlot) -> [srcId, srcSlotIndexNumber] に正規化（API仕様準拠）
function buildIncomingLinkIndex(
  wf: GuiWorkflow
): Map<string, [string, number]> {
  const linkIn = new Map<string, [string, number]>();
  for (const L of wf.links ?? []) {
    if (Array.isArray(L)) {
      // v0.4: [id, origin_id, origin_slot, target_id, target_slot, TYPE]
      const [, srcId, srcSlot, dstId, dstSlot] = L;
      linkIn.set(`${asId(dstId)}:${String(dstSlot)}`, [
        asId(srcId),
        Number(srcSlot),
      ]);
    } else if (L && typeof L === "object") {
      // v1.0: { origin_id, origin_slot, target_id, target_slot, ... }
      const srcId = L.origin_id,
        srcSlot = L.origin_slot;
      const dstId = L.target_id,
        dstSlot = L.target_slot;
      linkIn.set(`${asId(dstId)}:${String(dstSlot)}`, [
        asId(srcId),
        Number(srcSlot),
      ]);
    }
  }
  return linkIn;
}

// widgets_values 配列から、期待型に合う “次の” 値を取り出す
function popNextMatching(
  arr: any[],
  expectedType: string | undefined
): any | undefined {
  while (arr.length) {
    const v = arr.shift();
    // KSamplerの "randomize" のようなUI専用トグルは、型に合わなければスキップ
    if (expectedType === "INT" || expectedType === "FLOAT") {
      if (typeof v === "number") return v;
      // 数字文字列を許す
      if (
        typeof v === "string" &&
        v.trim() !== "" &&
        !Number.isNaN(Number(v))
      ) {
        return Number(v);
      }
      // "randomize" 等はスキップ
      continue;
    }
    if (
      expectedType === "STRING" ||
      expectedType === "COMBO" ||
      expectedType === "FILE" ||
      expectedType === "ENUM"
    ) {
      if (typeof v === "string") return v;
      // 数値→文字列を許容（例: ステップ数が文字化していたケース）
      if (typeof v === "number") return String(v);
      continue;
    }
    if (expectedType === "BOOLEAN") {
      if (typeof v === "boolean") return v;
      // 一部UIは "true"/"false"
      if (typeof v === "string") {
        if (v.toLowerCase() === "true") return true;
        if (v.toLowerCase() === "false") return false;
      }
      continue;
    }
    // 型不明 or ANY: そのまま採用
    return v;
  }
  return undefined;
}

// 追加: スカラーのデフォルトを決める（安全側）
function pickScalarDefault(_expectedType?: string): any | undefined {
  // 案A: 自動補完しない（object_info 由来 default のみ別途使用）
  return undefined;
}

// ---------- 本体: 厳密変換 ----------
export async function toApiPromptStrict(
  wf: GuiWorkflow,
  opts: StrictOptions
): Promise<ApiPrompt> {
  const { baseUrl, strictTypes = true, fillDefaults = false } = opts;
  const info = new ObjectInfoCache(baseUrl);

  // 除外したいノード種別（結果 JSON には出さない）
  const EXCLUDE_CLASS_TYPES = new Set([
    "Note",
    "MarkdownNote",
    // PrimitiveNode は値をインライン展開するため出力から除外
    "PrimitiveNode",
  ]);

  // 参照用: id -> node
  const nodeMap = new Map<string, GuiNode>();
  for (const n of wf.nodes ?? []) nodeMap.set(asId(n.id), n);

  // 出力名逆引き/入力リンク逆引きを構築
  // 出力スロット逆引き（現状未使用だが保持）
  const _outSlotIndex = buildOutputSlotIndex(wf.nodes ?? []);
  const linkInIndex = buildIncomingLinkIndex(wf);

  const result: ApiPrompt = {};

  for (const n of wf.nodes ?? []) {
    const nid = asId(n.id);
    const classType = n.type;
    const inputs: Record<string, any> = {};

    // widgets_values 取り出し（配列なら破壊的に消費する）
    let wvObj: Record<string, any> | undefined;
    let wvArr: any[] | undefined;
    if (Array.isArray(n.widgets_values)) {
      wvArr = [...n.widgets_values]; // コピーして消費
    } else if (n.widgets_values && typeof n.widgets_values === "object") {
      wvObj = { ...(n.widgets_values as any) };
    }

    // このクラスの入力定義
    const inputDecls = await info.listInputs(classType);
    const knownInputNames = new Set(inputDecls.map((x) => x.name));

    // GUI node の inputs（見た目の順）をもとに埋める：
    // 1) link がある → ["srcId", "出力名"]
    // 2) link が無く widget.name がある → widgets_values から値
    for (const [i, inp] of (n.inputs ?? []).entries()) {
      const inName = inp.name;
      // Comfy正規の入力名でない場合（localized_name等）は弾く
      if (knownInputNames.size && !knownInputNames.has(inName)) {
        // ただし一部カスタムノードで object_info が古く不一致のこともある
        // その場合は「GUIのnameを信じる」か「スキップ」か判断が必要
        // ここでは保守的に、無名リンクだけは拾う
      }

      if (inp.link != null) {
        const key = `${nid}:${String(inp.slot_index ?? i)}`;
        const ref = linkInIndex.get(key);
        if (!ref) {
          throw new Error(
            `Link dangling: dst(${nid}).${inName} slot=${String(
              inp.slot_index ?? i
            )}`
          );
        }
        // リンク元ノード（値インライン展開の判定用）
        const [srcId] = ref;
        const srcNode = nodeMap.get(srcId);
        const rawType = await info.getInputType(classType, inName);
        const expectType = normalizeScalarType(rawType);

        const isScalarExpected = expectType ? isScalarType(expectType) : false;

        // スカラー入力に対するリンクの場合でも widgets_values の位置合わせのため
        // 期待型がスカラーなら popNextMatching を実行して消費（値は破棄）
        if (isScalarExpected && wvArr) {
          // 破棄目的なので戻り値は使わない
          popNextMatching(wvArr, expectType);
        }

        if (srcNode && srcNode.type === "PrimitiveNode") {
          // PrimitiveNode からのリンクは値をインライン化
          // PrimitiveNode の widgets_values は配列先頭に値が入る想定
          let pVal: any;
          if (Array.isArray(srcNode.widgets_values)) {
            pVal = srcNode.widgets_values[0];
          } else if (
            srcNode.widgets_values &&
            typeof srcNode.widgets_values === "object"
          ) {
            // オブジェクト形式は出力 widget 名をキーにしている可能性があるが
            // 一般的には配列が使われる。安全側で最初のプロパティを拾う。
            const firstKey = Object.keys(srcNode.widgets_values as any)[0];
            pVal = (srcNode.widgets_values as any)[firstKey];
          }

          // 型調整: INT/FLOAT なのに文字列数字なら number 化
          if (
            (expectType === "INT" || expectType === "FLOAT") &&
            typeof pVal === "string" &&
            pVal.trim() !== "" &&
            !Number.isNaN(Number(pVal))
          ) {
            const num = Number(pVal);
            if (expectType === "INT") {
              pVal = Math.trunc(num);
            } else {
              pVal = num;
            }
          }

          inputs[inName] = pVal;
        } else {
          // 通常リンク: [srcNodeId, 出力スロット番号]
          inputs[inName] = ref; // ["srcNodeId", number]
        }
        continue;
      }

      // 値（widget）を割り当て
      if (inp.widget?.name) {
        const rawType = await info.getInputType(classType, inName);
        const expectType = normalizeScalarType(rawType);
        let val: any;

        if (wvObj && Object.hasOwn(wvObj, inp.widget.name)) {
          val = wvObj[inp.widget.name];
        } else if (wvArr) {
          // 型に合うものが現れるまで消費
          val = popNextMatching(wvArr, expectType);
        }

        if (val === undefined) {
          const def = pickScalarDefault(expectType);
          if (def !== undefined) {
            inputs[inName] = def;
            continue;
          }

          if (fillDefaults) {
            // 必要なら default をここで設定（object_info からデフォルト値が取れる場合に拡張）
          } else if (strictTypes) {
            // 必須かどうかを調べ、必須で型未一致/未指定ならエラー
            const reqNames = new Set(
              Object.keys((await info.get(classType))?.input?.required ?? {})
            );
            if (reqNames.has(inName)) {
              throw new Error(
                `Missing required scalar input: ${classType}.${inName} (node ${nid})`
              );
            }
          }
        } else {
          // 最終型チェック（strictTypes時）
          if (strictTypes && expectType && isScalarType(expectType)) {
            const ok =
              (expectType === "INT" &&
                typeof val === "number" &&
                Number.isInteger(val)) ||
              (expectType === "FLOAT" && typeof val === "number") ||
              (expectType === "STRING" && typeof val === "string") ||
              (expectType === "COMBO" &&
                (typeof val === "string" || typeof val === "number")) ||
              (expectType === "BOOLEAN" && typeof val === "boolean") ||
              (expectType === "FILE" && typeof val === "string") ||
              (expectType === "ENUM" &&
                (typeof val === "string" || typeof val === "number"));

            if (!ok) {
              throw new Error(
                `Type mismatch for ${classType}.${inName}: expected ${expectType}, got ${typeof val} (${JSON.stringify(
                  val
                )})`
              );
            }
          }
          inputs[inName] = val;
        }
      }
    }

    // --- 追加補完 ---
    // GUI の inputs[] に現れなかったが object_info 上では定義されているスカラー入力を
    // widgets_values (配列形式) から順に取り出して補完する。
    // 典型例: CLIPTextEncode の "text" が inputs[] に現れず widgets_values のみになるケース。
    if (wvArr?.length) {
      for (const decl of inputDecls) {
        if (inputs[decl.name] !== undefined) continue; // 既に埋まっている
        const expectTypeRaw = decl.type;
        const expectType = normalizeScalarType(expectTypeRaw);
        // リンク型はスキップ、それ以外（未知型含む）はスカラー扱い
        if (expectTypeRaw && LINK_TYPES.has(expectTypeRaw)) continue;
        const val = popNextMatching(wvArr, expectType);
        if (val !== undefined) {
          inputs[decl.name] = val;
        }
      }
    }
    // 初回の必須チェックは削除し、下部の統合チェックでデフォルト補完 / エラー判定を行う

    // object_info 上の required がまだ埋まってなければエラー/補完
    if (strictTypes) {
      const meta = await info.get(classType);
      const required = Object.keys(meta?.input?.required ?? {});
      for (const r of required) {
        if (inputs[r] === undefined) {
          // リンクで満たされるべきタイプ（MODELなど）はここでは未検出の可能性がある。
          // ただし GUI上 inputs[] に無い場合もあるので、最終的に未解決ならエラー。
          const tRaw = await info.getInputType(classType, r);
          const t = normalizeScalarType(tRaw);
          // 1) リンク系はここではスキップ（後でリンクで満たされる）
          if (t && LINK_TYPES.has(t)) continue;
          // 2) object_info の default があるなら採用（InputTypeDecl の第2要素 例: ["STRING", {default:"ComfyUI"}])
          if (t && isScalarType(t)) {
            const decl = await info.getInputDecl(classType, r);
            if (Array.isArray(decl) && decl[1] && typeof decl[1] === "object") {
              const maybeDefault = (decl[1] as any).default;
              if (maybeDefault !== undefined) {
                inputs[r] = maybeDefault;
                continue;
              }
            }
          }
          // 3) 依然未設定ならエラー
          if (inputs[r] === undefined) {
            console.error("DBG", {
              classType,
              nodeId: nid,
              requiredInput: r,
              objectInfo: await info.get(classType),
              nodeInputs: n.inputs,
              widgets_values: n.widgets_values,
            });
            throw new Error(
              `Missing required input: ${classType}.${r} (node ${nid})`
            );
          }
        }
      }
    }

    // API 形式へ（除外リストに入っていなければ結果登録）
    if (!EXCLUDE_CLASS_TYPES.has(classType)) {
      result[nid] = { class_type: classType, inputs };
    }
  }

  return result;
}
