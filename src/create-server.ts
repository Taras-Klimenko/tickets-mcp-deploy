import { McpServer } from "@modelcontextprotocol/server";
import { registerTools } from "./tools/register-tools.js";
import { registerResources } from "./resources/register-resources.js";
import { registerPrompts } from "./prompts/register-prompts.js";

/** Фабрика: SDK создаёт экземпляр сервера для подключённого клиента. */
export function createServer(): McpServer {
    const server = new McpServer({ name: "tickets", version: "1.0.0" });
    registerTools(server);
    registerResources(server);
    registerPrompts(server);
    return server;
}
