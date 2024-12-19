import ts from "typescript"

export function readConfigFile(baseDir: string) {
  const configFileName = ts.findConfigFile(baseDir, ts.sys.fileExists)
  if (!configFileName) throw new Error("tsconfig.json not found")
  const configFile = ts.readConfigFile(configFileName, ts.sys.readFile)
  return ts.parseJsonConfigFileContent(configFile.config, ts.sys, baseDir)
}
