import { opendir, readFile, writeFile } from "node:fs/promises"
import { parse } from "@typescript-eslint/typescript-estree"
import path from "node:path"
import ts from "typescript"
import { readConfigFile } from "./utils"

const baseDir = "/Users/shuji/github.com/terass-inc/tera-two"
const config = readConfigFile(baseDir)

console.debug = () => {}

const files: Record<string, Awaited<ReturnType<typeof parseFile>> | null> = {}
const deps: { from: string; to: string; source: string }[] = []

async function main({
  write = true,
  safe = false,
}: { write?: boolean; safe?: boolean } = {}) {
  for await (const filePath of walk(baseDir)) {
    console.debug(filePath)
    try {
      files[filePath] = await parseFile(filePath)
    } catch (error) {
      if (safe) throw error
      console.error(error)
      files[filePath] = null
    }
  }
  if (write) {
    await writeFile("./tmp/files.json", JSON.stringify(files, null, 2))
    await writeFile("./tmp/deps.json", JSON.stringify(deps, null, 2))
  }
}

async function parseFile(filePath: string) {
  const code = await readFile(filePath, "utf-8")
  const ast = parse(code, {
    filePath,
    jsx: true,
    // comment: true,
    loc: true,
    range: true,
    tokens: true,
  })
  for (const e of ast.body) {
    if (e.type === "ImportDeclaration") {
      if (/\.(jpg|png|svg|css)/.test(e.source.value)) continue
      console.debug(filePath, e.source.value)
      const { resolvedModule } = ts.resolveModuleName(
        e.source.value,
        filePath,
        config.options,
        ts.sys,
      )
      if (!resolvedModule) {
        console.error(filePath, e.source.value)
        throw new Error("module not found")
      }
      console.debug(e.source.value, resolvedModule?.resolvedFileName)
      deps.push({
        from: filePath,
        to: resolvedModule.resolvedFileName,
        source: e.source.value,
      })
    }
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
      if (!/\.((tsx?)|([mc]?jsx?))$/.test(d.name)) continue
      yield entry
    }
  }
}

main()
