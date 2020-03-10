import { Config } from "bili";

const config: Config = {
  input: "src/index.ts",
  output: {
    format: ["cjs", "umd", "esm"],
    moduleName: "prueba-firma",
    sourceMap: true,
    sourceMapExcludeSources: true
  },
  plugins: {
    typescript2: true,
    vue: {
      css: true
    },
    babel: { runtimeHelpers: true }
  },
  extendConfig(config, { format }) {
    if (format === "umd") {
      config.output.minify = true;
    }
    if (format === "esm") {
      config.output.fileName = "[name].module.js";
    }
    return config;
  },
  externals: ["vue-class-component", "vue-property-decorator", "bootstrap", "bootstrap-vue"]
};

export default config;
