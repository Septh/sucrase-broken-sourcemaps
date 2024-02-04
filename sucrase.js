// @ts-check
import { mkdir, readFile, writeFile } from 'fs/promises'
import { transform } from 'sucrase'

const inFile = 'source/index.ts'
const outFile = 'out-sucrase/index.js'

const sourceCode = await readFile(inFile, 'utf-8')
let { code, sourceMap } = transform(sourceCode, {
    filePath: 'index.ts',
    transforms: [ 'typescript', 'imports' ],
    preserveDynamicImport: true,
    disableESTransforms: true,
    injectCreateRequireForImportRequire: true,
    keepUnusedImports: true,
    sourceMapOptions: {
        compiledFilename: 'index.js'
    }
})

await mkdir('out').catch(() => {})
if (sourceMap) {
    sourceMap.sourceRoot ??= ''
    sourceMap.sources = [ '../source/index.ts' ]
    sourceMap.sourcesContent = [ sourceCode ]

    code += '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,'
                + Buffer.from(JSON.stringify(sourceMap)).toString('base64')
}
await writeFile(outFile, code)
