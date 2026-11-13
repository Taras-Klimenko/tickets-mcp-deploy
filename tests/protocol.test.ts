import assert from "node:assert/strict";
import test from "node:test";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { createServer } from "../src/create-server.js";

/** Интеграционный тест через настоящий MCP Client, без сети и без LLM. */
test("Tools, Resources, Prompts работают через современный MCP-протокол", async (t) => {
  const handler = createMcpHandler(createServer);
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: "tickets-test-client", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );

  try {
    await client.connect(transport);

    await t.test("инструменты опубликованы", async () => {
      const result = await client.listTools();
      assert.deepEqual(result.tools.map((tool) => tool.name).sort(), ["get_ticket", "search_tickets"]);
    });

    await t.test("поиск возвращает данные", async () => {
      const result = await client.callTool({
        name: "search_tickets",
        arguments: { query: "ошибка", limit: 2 },
      });
      assert.notEqual(result.isError, true);
      assert.match(JSON.stringify(result.content), /tickets/);
    });

    await t.test("ошибочные аргументы отсекаются схемой", async () => {
      const result = await client.callTool({
        name: "search_tickets",
        arguments: { query: "а", limit: 500 },
      });
      assert.equal(result.isError, true);
    });

    await t.test("несуществующая заявка — isError, а не сбой процесса", async () => {
      const result = await client.callTool({
        name: "get_ticket",
        arguments: { ticketId: 999 },
      });
      assert.equal(result.isError, true);
      assert.match(JSON.stringify(result.content), /не найдена/);
    });

    await t.test("публичный ресурс и шаблон доступны клиенту", async () => {
      const resources = await client.listResources();
      assert.ok(resources.resources.some((item) => item.uri === "stats://tickets/summary"));
      const templates = await client.listResourceTemplates();
      assert.ok(templates.resourceTemplates.some((item) => item.uriTemplate === "ticket://{ticketId}"));
      const stats = await client.readResource({ uri: "stats://tickets/summary" });
      assert.match(JSON.stringify(stats.contents), /byStatus/);
      const ticket = await client.readResource({ uri: "ticket://42" });
      assert.match(JSON.stringify(ticket.contents), /профиля/);
    });

    await t.test("промпт возвращает готовое сообщение", async () => {
      const result = await client.getPrompt({
        name: "triage-ticket",
        arguments: { ticketText: "Пользователь сообщает об ошибке загрузки файлов" },
      });
      assert.equal(result.messages[0]?.role, "user");
      assert.match(JSON.stringify(result.messages), /ошибке загрузки файлов/);
    });
  } finally {
    await client.close();
    await handler.close();
  }
});
