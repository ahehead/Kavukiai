import { Project, Node, SyntaxKind, type Symbol as MorphSymbol } from "ts-morph";
import path from "node:path";
import fs from "node:fs";

const [typeName, entryFile, outFile] = process.argv.slice(2);

if (!typeName || !entryFile || !outFile) {
  console.error("Usage: tsx scripts/extract-types.ts <TypeName> <EntryFile> <OutFile>");
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

  for (const decl of sym.getDeclarations()) {
    output.push(decl.getText());
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
