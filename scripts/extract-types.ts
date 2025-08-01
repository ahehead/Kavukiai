import fs from "node:fs";
import path from "node:path";
import {
  type Symbol as MorphSymbol,
  Node,
  Project,
  SyntaxKind,
} from "ts-morph";
import ts from "typescript";

const args = process.argv.slice(2);
const stripComments = args.includes("--no-comments");
if (stripComments) args.splice(args.indexOf("--no-comments"), 1);

const [typeName, entryFile, outFile] = args;

if (!typeName || !entryFile || !outFile) {
  console.error(
    "Usage: tsx scripts/extract-types.ts <TypeName> <EntryFile> <OutFile> [--no-comments]"
  );
  process.exit(1);
}

const project = new Project({
  tsConfigFilePath: path.resolve("tsconfig.json"),
});

// Ensure openai type definitions are loaded
project.addSourceFilesAtPaths("node_modules/openai/**/*.d.ts");

const source = project.addSourceFileAtPath(entryFile);
const identifier = source
  .getDescendantsOfKind(SyntaxKind.Identifier)
  .find((id) => id.getText() === typeName);

if (!identifier) {
  throw new Error(`Type ${typeName} not found in ${entryFile}`);
}

let symbol = identifier.getSymbol();
if (!symbol) throw new Error(`Symbol for ${typeName} not found`);
const aliased = symbol.getAliasedSymbol?.();
if (aliased) symbol = aliased;

const visitedSyms = new Set<string>();

// namespace パス（A.B.C）ごとに本文（宣言テキスト）を集約
type BucketKey = string; // "A.B.C" or ""
const buckets = new Map<BucketKey, string[]>();

const printer = ts.createPrinter({ removeComments: stripComments });

function isTypeDeclaration(node: Node) {
  return (
    Node.isInterfaceDeclaration(node) ||
    Node.isTypeAliasDeclaration(node) ||
    Node.isEnumDeclaration(node) ||
    Node.isClassDeclaration(node)
  );
}

function inExternalLib(d: Node) {
  const file = d.getSourceFile().getFilePath();
  return (
    file.includes("node_modules/typescript/lib") ||
    file.includes("node_modules/@types/")
  );
}

function getNamespacePath(n: Node): string[] {
  const path: string[] = [];
  let cur: Node | undefined = n.getParent();
  while (cur) {
    if (Node.isModuleDeclaration(cur)) path.unshift(cur.getName());
    cur = cur.getParent();
  }
  return path;
}

// 宣言テキストを軽量化（export/declare を先頭から取り除く）
function normalizeDeclText(text: string) {
  // 先頭行の export/declare は除去（複数行宣言にも効くように逐次）
  return text.replace(/^\s*export\s+/gm, "").replace(/^\s*declare\s+/gm, "");
}

// 型参照だけをたどる（値側識別子は無視）
function* iterTypeRefSymbols(root: Node): Iterable<MorphSymbol> {
  // Foo<T>, Bar.Baz など
  for (const t of root.getDescendantsOfKind(SyntaxKind.TypeReference)) {
    const typeName = t.getTypeName();
    let sym: MorphSymbol | undefined;
    if (Node.isIdentifier(typeName)) sym = typeName.getSymbol() ?? undefined;
    else if (Node.isQualifiedName(typeName))
      sym = typeName.getLeft().getSymbol() ?? undefined;
    if (sym) yield sym.getAliasedSymbol?.() ?? sym;
  }
  // extends/implements の T
  for (const e of root.getDescendantsOfKind(
    SyntaxKind.ExpressionWithTypeArguments
  )) {
    const s = e.getExpression().getSymbol();
    if (s) yield s.getAliasedSymbol?.() ?? s;
  }
  // import("pkg").X 形式
  for (const i of root.getDescendantsOfKind(SyntaxKind.ImportType)) {
    const id = i.getArgument()?.getDescendantsOfKind(SyntaxKind.Identifier)[0];
    const s = id?.getSymbol();
    if (s) yield s.getAliasedSymbol?.() ?? s;
  }
  // T[K] などの IndexedAccessType 内の参照
  for (const i of root.getDescendantsOfKind(SyntaxKind.IndexedAccessType)) {
    const obj = i.getObjectTypeNode();
    if (obj) {
      for (const s of iterTypeRefSymbols(obj)) yield s;
    }
  }
  // MappedType の keyof T など
  for (const m of root.getDescendantsOfKind(SyntaxKind.MappedType)) {
    const typeParam = m.getTypeParameter();
    const constraint = typeParam?.getConstraint();
    if (constraint) {
      for (const s of iterTypeRefSymbols(constraint)) yield s;
    }
  }
}

function emitDeclIntoBucket(decl: Node) {
  const nsPath = getNamespacePath(decl).join(".");
  const text = stripComments
    ? printer.printNode(
        ts.EmitHint.Unspecified,
        decl.compilerNode,
        decl.getSourceFile().compilerNode
      )
    : decl.getText();
  const norm = normalizeDeclText(text).trim();

  // テキスト重複排除（宣言マージ・多重定義の冗長さを軽減）
  const arr = buckets.get(nsPath) ?? [];
  if (!arr.includes(norm)) {
    arr.push(norm);
    buckets.set(nsPath, arr);
  }
}

function addSymbolStrict(sym: MorphSymbol) {
  const fqn = sym.getFullyQualifiedName();
  if (visitedSyms.has(fqn)) return;
  visitedSyms.add(fqn);

  // 型宣言のみ残す（外部 lib/@types は除外）
  const decls = sym
    .getDeclarations()
    .filter((d) => isTypeDeclaration(d) && !inExternalLib(d));
  if (decls.length === 0) return;

  for (const d of decls) {
    emitDeclIntoBucket(d);
    for (const ref of iterTypeRefSymbols(d)) addSymbolStrict(ref);
  }
}

// エントリから辿る
addSymbolStrict(symbol);

// 出力（ルート→浅い namespace → 深い namespace の順）
function printBuckets() {
  const parts: string[] = [];
  const entries = [...buckets.entries()].sort(
    (a, b) => a[0].split(".").length - b[0].split(".").length
  );

  for (const [nsPath, decls] of entries) {
    const body = decls.join("\n\n");
    if (!nsPath) {
      parts.push(body);
    } else {
      const names = nsPath.split(".");
      const open = names.map((n) => `namespace ${n} {`).join(" ");
      const close = names.map(() => `}`).join(" ");
      parts.push(`${open}\n${body}\n${close}`);
    }
  }
  fs.writeFileSync(outFile, parts.join("\n\n"));
}

printBuckets();
