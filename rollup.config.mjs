import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "./src/index.js",
  output: {
    file: "./dist/mapbox-gl-draw-passing-mode.js",
    format: "umd",
    name: "mapboxGlDrawPassingMode",
  },
  plugins: [nodeResolve(), terser(), commonjs()],
};
