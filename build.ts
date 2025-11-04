
await Bun.build({
  entrypoints: ["./packages/index.ts"],
  outdir: "./dist/esm",
  target: "browser",
  format: "esm",
  sourcemap: true,
  minify: false,
})
await Bun.build({
  entrypoints: ["./packages/index.ts"],
  outdir: "./dist/cjs",
  target: "browser",
  format: "cjs",
  sourcemap: true,
  minify: false,
})


export { };
