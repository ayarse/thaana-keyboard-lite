import { networkInterfaces } from "node:os";

const PORT = Number(process.env.PORT) || 3000;
const ROOT = "examples";
const LIB_PATH = "thaana-keyboard-lite.js";
const TUNNEL = process.argv.includes("--tunnel");

const CDN_LIB = "https://esm.sh/thaana-keyboard-lite";
const LOCAL_LIB = "/thaana-keyboard-lite.js";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

async function bundleReact(): Promise<Response> {
  const result = await Bun.build({
    entrypoints: ["examples/react/src/main.jsx"],
    target: "browser",
    external: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "thaana-keyboard-lite",
    ],
    define: { "process.env.NODE_ENV": JSON.stringify("development") },
  });
  if (!result.success) {
    const msg = result.logs.map(String).join("\n");
    return new Response(`/* dev build failed */\nconsole.error(${JSON.stringify(msg)});`, {
      status: 500,
      headers: { "Content-Type": MIME[".js"] },
    });
  }
  return new Response(await result.outputs[0].text(), {
    headers: { "Content-Type": MIME[".js"], "Cache-Control": "no-store" },
  });
}

const server = Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === "/thaana-keyboard-lite.js" || pathname === "/thaana-keyboard-lite") {
      return new Response(Bun.file(LIB_PATH), {
        headers: { "Content-Type": MIME[".js"], "Cache-Control": "no-store" },
      });
    }

    if (pathname === "/react/main.js") return bundleReact();

    if (pathname.endsWith("/")) pathname += "index.html";
    const filePath = `${ROOT}${pathname}`;
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      return new Response("Not found", { status: 404 });
    }

    const ext = pathname.slice(pathname.lastIndexOf("."));
    const contentType = MIME[ext] ?? "application/octet-stream";

    if (ext === ".html") {
      const text = (await file.text()).replaceAll(CDN_LIB, LOCAL_LIB);
      return new Response(text, {
        headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
      });
    }

    return new Response(file, {
      headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
    });
  },
});

const lanIp = Object.values(networkInterfaces())
  .flat()
  .find((i) => i && i.family === "IPv4" && !i.internal)?.address;

console.log(`\n  ➜  Local:    http://localhost:${server.port}/`);
if (lanIp) console.log(`  ➜  Network:  http://${lanIp}:${server.port}/`);

if (TUNNEL) {
  console.log("  ➜  Tunnel:   starting ngrok...\n");
  const proc = Bun.spawn(["ngrok", "http", String(server.port), "--log=stdout"], {
    stdout: "inherit",
    stderr: "inherit",
  });
  const shutdown = () => {
    proc.kill();
    server.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  await proc.exited;
  server.stop();
}
