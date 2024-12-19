import type { API, FileInfo } from "jscodeshift"
import { dirname } from "node:path"
import ts from "typescript"
import { readConfigFile } from "./utils"
import console from "node:console"
import { existsSync } from "node:fs"

// npx jscodeshift --transform ./transform.ts --parser tsx
export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift
  const root = j(file.source)
  const config = readConfigFile(dirname(file.path))
  return root
    .find(j.ImportDeclaration)
    .forEach((path) => {
      const source = path.value.source.value
      if (typeof source === "string" && source.startsWith("./")) {
        const { resolvedModule } = ts.resolveModuleName(
          source,
          file.path,
          config.options,
          ts.sys,
        )
        if (!resolvedModule) {
          console.info(file.path, source)
          throw new Error("module not found")
        }
        if (!existsSync(resolvedModule.resolvedFileName)) {
          console.info(file.path, source, resolvedModule.resolvedFileName)
          throw new Error("module not found")
        }
        console.log(resolvedModule.resolvedFileName)
      }
    })
    .toSource()
}
