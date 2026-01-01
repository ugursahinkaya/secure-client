import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import terser from "@rollup/plugin-terser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.node.js",
        format: "es",
      },
      {
        file: "dist/index.js",
        format: "es",
      },
      {
        file: "dist/secure-auth.umd.js",
        name: "Mecra",
        extend: true,
        format: "umd",
        globals: {
          "@ugursahinkaya/generic-router": "Mecra",
          "@ugursahinkaya/secure-fetch": "Mecra",
          "@ugursahinkaya/logger": "Mecra",
          "@ugursahinkaya/native-bridge": "Mecra",
        },
      },
    ],
    external: [
      "@ugursahinkaya/generic-router",
      "@ugursahinkaya/secure-fetch",
      "@ugursahinkaya/logger",
      "@ugursahinkaya/native-bridge",
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      //terser(),
    ],
  },
  {
    input: resolve(__dirname, "dist/index.d.ts"),
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
