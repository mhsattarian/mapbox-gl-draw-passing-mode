import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";


export default {
  input: "./index.js",
  output: {
    file: "./dist/mapbox-gl-draw-passing-mode.js",
    format: "umd",
    name: "mapboxGlDrawPassingMode",
  },
  plugins: [nodeResolve(), terser()],
};
