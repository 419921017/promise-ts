/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: power_840
 * @Date: 2021-03-25 20:10:54
 * @LastEditors: power_840
 * @LastEditTime: 2021-03-25 20:46:47
 */
import path from "path";

import tsPlugin from "rollup-plugin-typescript2";
import jsonPlugin from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";

export default {
  input: path.resolve("src/index.ts"),
  output: {
    exports: "auto",
    file: "dist/bundle.cjs.js",
    format: "cjs",
  },
  plugins: [
    jsonPlugin(),
    tsPlugin({ tsconfig: path.resolve("tsconfig.json") }),
    nodeResolve(),
  ],
};
