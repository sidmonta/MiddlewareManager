import babel from "@rollup/plugin-babel"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import { terser } from "rollup-plugin-terser"

export default {
  input: "lib/index.js",
  output: [
    { file: "build/bundle.es.js", format: "es", sourcemap: false },
    {
      file: "build/bundle.js",
      format: "umd",
      sourcemap: false,
      name: "pipe-manager",
    },
  ],
  plugins: [
    commonjs(),
    resolve({
      customResolveOptions: {
        moduleDirectories: ["node_modules"],
      },
    }),
    // babel({ babelHelpers: "runtime", exclude: "**/node_modules/**" }),
    terser(),
  ],
}
