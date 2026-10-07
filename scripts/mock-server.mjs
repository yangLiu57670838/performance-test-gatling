// Minimal API matching the `local` target in src/config/targets.ts.
// Usage: npm run mock            (PORT=4000 npm run mock to change the port)
import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3000);
const items = new Map([
  [1, { id: 1, name: "keyboard", price: 49.99 }],
  [2, { id: 2, name: "mouse", price: 19.99 }]
]);
let nextId = 3;

const send = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
};

const readJson = (req) =>
  new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${port}`);

  if (req.method === "GET" && pathname === "/health") {
    return send(res, 200, { status: "ok" });
  }
  if (req.method === "GET" && pathname === "/api/items") {
    return send(res, 200, [...items.values()]);
  }
  const match = pathname.match(/^\/api\/items\/(\d+)$/);
  if (req.method === "GET" && match) {
    const item = items.get(Number(match[1]));
    return item ? send(res, 200, item) : send(res, 404, { error: "not found" });
  }
  if (req.method === "POST" && pathname === "/api/items") {
    const item = { id: nextId++, ...(await readJson(req)) };
    if (items.size < 1000) items.set(item.id, item);
    return send(res, 201, item);
  }
  send(res, 404, { error: "not found" });
}).listen(port, () => console.log(`Mock API listening on http://localhost:${port}`));
