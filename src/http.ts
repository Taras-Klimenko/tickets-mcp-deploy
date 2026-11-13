/**
 * Streamable HTTP entrypoint для Render и других Node.js-хостингов.
 * Пример для личного учебного сервера с заранее согласованным статическим
 * токеном. НЕ является полноценной OAuth 2.1-интеграцией.
 */
import 'dotenv/config';
import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { createMcpExpressApp } from "@modelcontextprotocol/express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { createServer } from "./create-server.js";

const token = process.env.MCP_API_TOKEN;

if (!token || Buffer.byteLength(token, "utf8") < 32) {
  throw new Error("MCP_API_TOKEN must be at least 32 UTF-8 bytes");
}

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? "3000");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

// Список разрешённых Host-заголовков. На Render hostname выставляется автоматически.
const hosts = ["127.0.0.1", "localhost", process.env.RENDER_EXTERNAL_HOSTNAME];
const extraHosts = (process.env.MCP_ALLOWED_HOSTS ?? "").split(",");
const allowedHosts = [...new Set([...hosts, ...extraHosts].map((x) => x?.trim()).filter((x): x is string => Boolean(x)))];

if (host === "0.0.0.0" && allowedHosts.every((value) => value === "127.0.0.1" || value === "localhost")) {
  throw new Error("Specify RENDER_EXTERNAL_HOSTNAME or MCP_ALLOWED_HOSTS for public hosting");
}

function requireDemoBearer(req: Request, res: Response, next: NextFunction): void {
  const match = /^Bearer (.+)$/i.exec(req.get("authorization") ?? "");
  const provided = Buffer.from(match?.[1] ?? "", "utf8");
  const expected = Buffer.from(token!, "utf8");
  const valid = provided.length === expected.length && timingSafeEqual(provided, expected);
  if (!valid) {
    res.setHeader("WWW-Authenticate", 'Bearer realm="tickets-mcp"');
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

const app = createMcpExpressApp({ host, allowedHosts });
const handler = toNodeHandler(createMcpHandler(createServer));

// Доступен хостингу без токена. Не возвращает внутреннюю информацию приложения.
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Express уже прочитал JSON, поэтому передаём req.body третьим аргументом.
app.all("/mcp", requireDemoBearer, (req, res) => void handler(req, res, req.body));

app.listen(port, host, () => {
  console.error(`[tickets-mcp-server] HTTP listening on ${host}:${port}`);
});
