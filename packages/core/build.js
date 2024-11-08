import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.js",
    platform: "browser",
    target: ["esnext"],
    sourcemap: true,
    minify: true,
    format: "esm",
    bundle: true,
    metafile: true,
  })
  .then((res) => esbuild.analyzeMetafile(res.metafile))
  .then(console.log)
  .catch(() => process.exit(1));
