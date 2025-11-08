
await Bun.build({
  entrypoints: ["./packages/index.ts"],
  outdir: "./dist/esm",
  target: "node",
  format: "esm",
  minify: false,
})
await Bun.build({
  entrypoints: ["./packages/index.ts"],
  outdir: "./dist/cjs",
  target: "node",
  format: "cjs",
  minify: false,
})

export { };
