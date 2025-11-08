
await Bun.build({
  entrypoints: ["./packages/index.ts"],
  outdir: "./dist/esm",
  target: "node",
  format: "esm",
  sourcemap: true,
  minify: false,
})
await Bun.build({
  entrypoints: ["./packages/index.ts"],
  outdir: "./dist/cjs",
  target: "node",
  format: "cjs",
  sourcemap: true,
  minify: false,
})

export { };
