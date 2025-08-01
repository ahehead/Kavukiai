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
const output: string[] = [];
const printer = ts.createPrinter({ removeComments: stripComments });

function isTypeDeclaration(node: Node) {
  return (
    Node.isInterfaceDeclaration(node) ||
    Node.isTypeAliasDeclaration(node) ||
    Node.isEnumDeclaration(node) ||
    Node.isClassDeclaration(node)
  );
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
    output.push(text);
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
fs.writeFileSync(outFile, output.join("\n\n"));
