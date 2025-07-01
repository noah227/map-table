const {nodeResolve} = require("@rollup/plugin-node-resolve")
const commonjs = require("@rollup/plugin-commonjs")
const typescript = require("@rollup/plugin-typescript")
const terser = require("@rollup/plugin-terser")
const json = require("@rollup/plugin-json")

/**
 * @param input {String}
 * @param output {Object}
 * @param plugins {{useTerser?: Boolean}?}
 */
const createExport = (input, output, plugins) => ({
    input, output,
    plugins: [
        nodeResolve(),
        typescript({
            compilerOptions: {
                sourceMap: output.sourcemap,
            },
            sourceMap: output.sourcemap,
        }),
        commonjs(),
        plugins?.useTerser && terser(),
        json()
    ]
})

/**
 *
 * @param {{input: string, output: string, target: "esm" | "cjs", userTerser?: boolean}[]} buildConfigList
 */
const createBuild = (buildConfigList) => {
    return buildConfigList.reduce((buildList, {input, output, target, userTerser}) => {
        buildList.push([
            input, {
                file: output,
                format: target
            }, {
                userTerser
            }
        ])
        return buildList
    }, []).map(item => createExport(...item))
}

module.exports = createBuild([
    {input: "./src/index.ts", output: "./dist/index.js", target: "esm"},
    // {input: "./src/index.ts", output: "./dist/index.min.js", target: "esm", userTerser: true},
    // {input: "./src/index.ts", output: "./dist/index.cjs.js", target: "cjs"}
])
