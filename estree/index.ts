import { opendir, readFile, writeFile } from "node:fs/promises"
import { parse } from "@typescript-eslint/typescript-estree"
import path from "node:path"
import * as ts from "typescript"

const baseDir = "/Users/shuji/github.com/terass-inc/tera-two/frontend"
const config = readConfigFile(baseDir)

console.debug = () => {}

async function main() {
  const map: Record<string, Awaited<ReturnType<typeof parseFile>> | null> = {}
  for await (const filePath of walk(baseDir)) {
    console.debug(filePath)
    try {
      map[filePath] = await parseFile(filePath)
    } catch (e) {
      map[filePath] = null
      console.error(e)
    }
  }
  if (false) {
    await writeFile("./tmp.json", JSON.stringify(map, null, 2))
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
    // tokens: true,
  })
  for (const e of ast.body) {
    if (e.type === "ImportDeclaration") {
      if (/\.(jpg|png|svg|css)/.test(e.source.value)) continue
      const ret = ts.resolveModuleName(
        e.source.value,
        filePath,
        config.options,
        ts.sys,
      )
      if (!ret.resolvedModule) {
        console.info(filePath, e.source.value)
        throw new Error("module not found")
      }
      if (e.source.value.startsWith(".")) {
        console.log(
          filePath,
          e.source.value,
          ret.resolvedModule?.resolvedFileName,
        )
      }
      console.debug(e.source.value, ret.resolvedModule?.resolvedFileName)
    }
  }
  return ast
}

function readConfigFile(baseDir: string) {
  const configFileName = ts.findConfigFile(baseDir, ts.sys.fileExists)
  if (!configFileName) throw new Error("tsconfig.json not found")
  const configFile = ts.readConfigFile(configFileName, ts.sys.readFile)
  return ts.parseJsonConfigFileContent(configFile.config, ts.sys, baseDir)
}

async function* walk(dir: string): AsyncGenerator<string> {
  for await (const d of await opendir(dir)) {
    const entry = path.join(dir, d.name)
    if (d.name.startsWith(".")) continue
    if (d.isDirectory()) {
      if (d.name === "node_modules") continue
      yield* walk(entry)
    } else if (d.isFile()) {
      if (!/\.(js|jsx|ts|tsx)$/.test(d.name)) continue
      yield entry
    }
  }
}

main()
