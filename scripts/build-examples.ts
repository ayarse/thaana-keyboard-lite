import { cp, rm } from "node:fs/promises";

const OUT = "dist/examples";
const EXTERNAL = [
  "react",
  "react-dom",
  "react-dom/client",
  "react/jsx-runtime",
  "thaana-keyboard-lite",
];

await rm(OUT, { recursive: true, force: true });

await cp("examples/index.html", `${OUT}/index.html`);
await cp("examples/shared.css", `${OUT}/shared.css`);
await cp("examples/vanilla", `${OUT}/vanilla`, { recursive: true });
await cp("examples/vue", `${OUT}/vue`, { recursive: true });
await cp("examples/react/index.html", `${OUT}/react/index.html`);

const result = await Bun.build({
  entrypoints: ["examples/react/src/main.jsx"],
  outdir: `${OUT}/react`,
  target: "browser",
  external: EXTERNAL,
  minify: true,
  naming: "main.js",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

console.log(`✓ Examples built to ${OUT}/`);
