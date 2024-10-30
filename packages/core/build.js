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
  })
  .catch(() => process.exit(1));
