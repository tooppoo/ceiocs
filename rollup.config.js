import fs from "fs";
import path from "path";
import typescript from "rollup-plugin-typescript2";
import istanbul from "rollup-plugin-istanbul";

const plugins = {
  required: [typescript],
  production: [],
  develop: [istanbul],
  select() {
    const extract = plgs => plgs.map(p => p());

    if (process.env.NODE_ENV === "production") {
      return extract([...this.required, ...this.production]);
    } else {
      return extract([...this.required, ...this.develop]);
    }
  }
};

const formats = ["cjs", "es", "amd", "umd"];
const ignorePackage = new Set(['common'])
const packages = fs
  .readdirSync(path.resolve(__dirname, "packages"), {
    withFileTypes: true
  })
  .filter(maybeDir => maybeDir.isDirectory())
  .map(dir => dir.name)
  .filter(pkg => !ignorePackage.has(pkg))

const configsForEachPackage = packages.reduce(
  (prev, pkg) => [
    ...prev,
    ...formats.map(fmt => ({
      input: path.resolve(__dirname, "packages", pkg, "src", "index.ts"),
      output: {
        name: `conditions-${pkg}-${fmt}`,
        file: `./dist/${pkg}.${fmt}.js`,
        format: fmt
      },
      plugins: plugins.select()
    }))
  ],
  []
);
const configsForEntry = formats.map(fmt => ({
  input: path.resolve(__dirname, "packages", "index.ts"),
  output: {
    name: `conditions-${fmt}`,
    file: path.resolve("dist", `index.${fmt}.js`),
    format: fmt
  },
  plugins: plugins.select()
}));

export default [...configsForEntry, ...configsForEachPackage];
