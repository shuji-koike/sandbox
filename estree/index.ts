import {
  AST_NODE_TYPES,
  parse,
  simpleTraverse,
} from "@typescript-eslint/typescript-estree"
import { opendir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import ts from "typescript"
import { readConfigFile } from "./utils"
import { createWriteStream } from "node:fs"

console.debug = () => {}

const files: Record<string, Awaited<ReturnType<typeof parseFile>> | null> = {}
const deps: { from: string; to?: string; source: string }[] = []

// main({})
main2()

async function main2() {
  const data = await (await import("./tmp/deps.json")).default
  const writeable = createWriteStream("./tmp/deps.dot")
  // https://graphviz.org/docs/layouts/
  process.stdout.write(`
digraph mygraph {
  fontname="sans-serif"
  node [fontname="sans-serif"]
  edge [fontname="sans-serif"]
  node [shape=box];
  engine=sfdp
  rankdir=LR
  ${[
    ...new Set(
      data
        .filter((e) => e.to && !e.to.includes("node_modules/"))
        // .map((e) => ({
        //   from: path.resolve(e.from, "../.."),
        //   to: path.resolve(e.to!, "../.."),
        // }))
        .map((e) => `"to:${e.to}" -> "from:${e.from}"`),
    ),
  ]
    .sort()
    .join("\n")}
}
`)
  writeable.close()
}

async function main({
  baseDir,
  write = true,
  safe = false,
}: {
  baseDir?: string
  write?: boolean
  safe?: boolean
}) {
  baseDir = path.resolve(process.env.BASE_DIR || ".")
  for await (const filePath of walk(baseDir)) {
    console.debug(filePath)
    try {
      files[filePath] = await parseFile(baseDir, filePath)
    } catch (error) {
      if (safe) throw error
      console.error(error)
      files[filePath] = null
    }
  }
  if (write) {
    await writeFile("./tmp/deps.json", JSON.stringify(deps, null, 2))
  }
}

async function parseFile(baseDir: string, filePath: string) {
  console.debug(parseFile.name, filePath)
  const code = await readFile(filePath, "utf-8")
  const config = readConfigFile(baseDir)
  const ast = parse(code, {
    filePath,
    jsx: true,
    // comment: true,
    loc: true,
    range: true,
    tokens: false,
  })
  simpleTraverse(ast, {
    enter(node) {
      // https://typescript-eslint.io/packages/typescript-estree/ast-spec
      if (node.type === AST_NODE_TYPES.ImportDeclaration) {
        if (/\.(jpg|png|svg|css|scss|sass)/.test(node.source.value)) return
        console.debug(filePath, node.source.value)
        resolve(node.source.value)
      }
      if (node.type === AST_NODE_TYPES.ImportExpression) {
        if (
          node.source.type === AST_NODE_TYPES.Literal &&
          typeof node.source.value === "string"
        ) {
          console.debug(filePath, node.source.value)
          resolve(node.source.value)
        } else {
          console.error("ImportExpression: source is not a Literal", filePath)
        }
      }
    },
  })
  function resolve(source: string) {
    const { resolvedModule } = ts.resolveModuleName(
      source,
      filePath,
      config.options,
      ts.sys,
    )
    if (!resolvedModule) {
      console.error("module not found", filePath, source)
    }
    console.debug(source, resolvedModule?.resolvedFileName)
    deps.push({
      from: filePath.replace(`${baseDir}/`, ""),
      to: resolvedModule?.resolvedFileName.replace(`${baseDir}/`, ""),
      source,
    })
  }
  return ast
}

async function* walk(dir: string): AsyncGenerator<string> {
  for await (const d of await opendir(dir)) {
    const entry = path.join(dir, d.name)
    if (d.name.startsWith(".")) continue
    if (d.isDirectory()) {
      if (d.name === "node_modules") continue
      yield* walk(entry)
    } else if (d.isFile()) {
      if (!/\.(([cm]?tsx?)|([cm]?jsx?))$/.test(d.name)) continue
      yield entry
    }
  }
}
