// @ts-check
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'node:path/posix'
import { transform } from 'sucrase'
import { glob } from 'glob'

const rootDir = "source"
const outDir = "out-sucrase"

const filePaths = await glob('**/*.{ts,mts,cts}', { cwd: rootDir }).then(files => files.map(f => f.replaceAll('\\', '/')))
for (const filePath of filePaths) {

    const inFile = path.join(rootDir, filePath)
    const outFile = path.join(outDir, filePath.replace(/ts$/, 'js'))

    const sourceCode = await readFile(inFile, 'utf-8')
    const result = transform(sourceCode, {
        filePath,
        transforms: filePath.endsWith('.cts') ? [ 'typescript', 'imports' ] : [ 'typescript' ],
        preserveDynamicImport: true,
        disableESTransforms: true,
        injectCreateRequireForImportRequire: true,
        keepUnusedImports: true,
        sourceMapOptions: {
            compiledFilename: path.basename(outFile)
        }
    })

    await mkdir(path.dirname(outFile), { recursive: true })
    if (result.sourceMap) {
        result.sourceMap.sourceRoot ??= ''
        result.sourceMap.sources = [ path.relative(path.dirname(outFile), inFile) ]
        result.sourceMap.sourcesContent = [ sourceCode ]
        await writeFile(outFile + '.map', JSON.stringify(result.sourceMap))
    }
    await writeFile(outFile, result.code + '\n//# sourceMappingURL=' + path.basename(outFile) + '.map')
}
