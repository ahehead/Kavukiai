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
if (!symbol) {
  throw new Error(`Symbol for ${typeName} not found`);
}

const aliased = symbol.getAliasedSymbol?.();
if (aliased) symbol = aliased;

const visited = new Set<string>();
const namespaces = new Map<string, Map<string, string>>(); // namespace名 -> { 型名 -> 型定義 }
const globalTypes = new Map<string, string>(); // 型名 -> 型定義
const printer = ts.createPrinter({ removeComments: stripComments });

function isTypeDeclaration(node: Node) {
  return (
    Node.isInterfaceDeclaration(node) ||
    Node.isTypeAliasDeclaration(node) ||
    Node.isEnumDeclaration(node) ||
    Node.isClassDeclaration(node)
  );
}

function getNamespaceInfo(decl: Node) {
  const ancestors = decl.getAncestors();
  const namespaceAncestor = ancestors.find(Node.isModuleDeclaration);

  if (namespaceAncestor?.getName) {
    return namespaceAncestor.getName();
  }
  return null;
}

// 型名を取得するヘルパー関数
function getTypeName(decl: Node): string | null {
  if (Node.isInterfaceDeclaration(decl)) {
    return decl.getName() ?? null;
  }
  if (Node.isTypeAliasDeclaration(decl)) {
    return decl.getName() ?? null;
  }
  if (Node.isEnumDeclaration(decl)) {
    return decl.getName() ?? null;
  }
  if (Node.isClassDeclaration(decl)) {
    return decl.getName() ?? null;
  }
  return null;
}

// exportキーワードを削除するヘルパー関数
function removeExportKeyword(text: string): string {
  return text.replace(/^export\s+/, "");
}

function addSymbol(sym: MorphSymbol) {
  const key = sym.getFullyQualifiedName();
  if (visited.has(key)) return;
  visited.add(key);

  const decls = sym.getDeclarations().filter((d) => {
    const file = d.getSourceFile().getFilePath();
    return (
      !file.includes("node_modules/typescript/lib") &&
      !file.includes("node_modules/@types/")
    );
  });
  if (decls.length === 0) return;

  for (const decl of decls) {
    const text = stripComments
      ? printer.printNode(
          ts.EmitHint.Unspecified,
          decl.compilerNode,
          decl.getSourceFile().compilerNode
        )
      : decl.getText();

    // namespace情報を取得
    const namespaceName = getNamespaceInfo(decl);
    const typeName = getTypeName(decl);

    if (namespaceName) {
      // namespaceありの場合
      if (!namespaces.has(namespaceName)) {
        namespaces.set(namespaceName, new Map<string, string>());
      }

      const namespaceTypes = namespaces.get(namespaceName);
      if (!namespaceTypes) continue;

      // namespace内で重複チェック（型名がある場合のみ）
      if (typeName && namespaceTypes.has(typeName)) {
        console.warn(
          `Duplicate type name detected in namespace ${namespaceName}: ${typeName}. Skipping...`
        );
        continue;
      }

      // namespace内ではexportを削除
      const cleanText = removeExportKeyword(text);

      if (typeName) {
        namespaceTypes.set(typeName, cleanText);
      } else {
        // 型名が取得できない場合は、テキストの一部をキーとして使用
        const keyFromText = cleanText.split("\n")[0].slice(0, 50);
        namespaceTypes.set(keyFromText, cleanText);
      }
    } else {
      // namespace外の場合
      if (typeName && globalTypes.has(typeName)) {
        // 同名の型が既に存在する場合はスキップ
        console.warn(
          `Duplicate global type name detected: ${typeName}. Skipping...`
        );
        continue;
      }

      if (typeName) {
        globalTypes.set(typeName, text);
      } else {
        // 型名が取得できない場合は、テキストの一部をキーとして使用
        const keyFromText = text.split("\n")[0].slice(0, 50);
        globalTypes.set(keyFromText, text);
      }
    }

    decl.forEachDescendant((n) => {
      if (Node.isIdentifier(n)) {
        const s = n.getSymbol();
        if (!s) return;
        const target = s.getAliasedSymbol?.() ?? s;
        if (target.getDeclarations().some(isTypeDeclaration)) {
          addSymbol(target);
        }
      }
    });
  }
}

addSymbol(symbol);

// 出力を整理して構築
const output: string[] = [];

// グローバルな型定義を先に出力
if (globalTypes.size > 0) {
  for (const [, typeDefinition] of globalTypes) {
    output.push(typeDefinition);
  }
}

// namespace毎に整理して出力
for (const [namespaceName, types] of namespaces.entries()) {
  if (types.size === 0) continue;

  output.push(`declare namespace ${namespaceName} {`);
  for (const [, typeDefinition] of types) {
    // インデントを追加
    const indentedType = typeDefinition
      .split("\n")
      .map((line) => (line.trim() ? `  ${line}` : line))
      .join("\n");
    output.push(indentedType);
  }
  output.push("}");
}

fs.writeFileSync(outFile, output.join("\n\n"));
