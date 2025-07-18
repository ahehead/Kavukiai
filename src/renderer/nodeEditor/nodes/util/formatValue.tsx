
/**
 * 値を文字列化するユーティリティ関数
 * @param v - 任意の値
 * @returns - 文字列化された値
 */
export function formatValue(v: unknown): string {
  // 原始型
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint')
    return String(v);
  if (typeof v === 'function') return `[Function ${v.name ?? 'anonymous'}]`;

  // 配列・オブジェクトは JSON.stringify で整形 (循環参照対策付き)
  try {
    const cache = new WeakSet();
    return JSON.stringify(
      v,
      (_k, val) => {
        if (typeof val === 'object' && val !== null) {
          if (cache.has(val)) return '[Circular]';
          cache.add(val);
        }
        return val;
      },
      2 /* インデント */
    );
  } catch {
    // stringify 失敗時 util.inspect 風フォールバック
    return Object.prototype.toString.call(v);
  }
}
