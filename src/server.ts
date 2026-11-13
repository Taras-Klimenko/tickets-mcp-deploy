import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createServer } from "./create-server.js";

// STDOUT зарезервирован для JSON-RPC. console.log здесь сломает stdio-транспорт.
void serveStdio(createServer);
console.error("[tickets-mcp-server] stdio transport ready");
