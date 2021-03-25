import path from 'path';

import tsPlugin from 'rollup-plugin-typescript2';
import jsonPlugin from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';

export default {
  input: path.resolve('src/index.ts'),
  output: {
    file: 'dist/bundle.cjs.js',
    format: 'cjs',
  },
  plugins: [
    jsonPlugin(),
    tsPlugin({ tsconfig: path.resolve('tsconfig.json') }),
    nodeResolve(),
  ],
};
