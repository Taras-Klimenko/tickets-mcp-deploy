import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const client = new Client(
    { name: "tickets-demo-client", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
);

const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["dist/server.js"],
    cwd: process.cwd(),
});

async function main(): Promise<void> {
    await client.connect(transport);
    try {
        console.log("Protocol era:", client.getProtocolEra());
        console.log("Tools:", (await client.listTools()).tools.map((t) => t.name));

        const found = await client.callTool({
            name: "search_tickets",
            arguments: { query: "ошибка", limit: 2 },
        });
        console.log("Search result:", JSON.stringify(found, null, 2));

        const notFound = await client.callTool({
            name: "get_ticket",
            arguments: { ticketId: 999 },
        });
        console.log("Missing ticket (isError=true):", JSON.stringify(notFound, null, 2));

        const resources = await client.listResources();
        console.log("Resources:", resources.resources.map((r) => r.uri));
        console.log("Stats:", JSON.stringify(await client.readResource({ uri: "stats://tickets/summary" }), null, 2));

        const templates = await client.listResourceTemplates();
        console.log("Resource templates:", templates.resourceTemplates.map((t) => t.uriTemplate));
        console.log("Ticket 42:", JSON.stringify(await client.readResource({ uri: "ticket://42" }), null, 2));

        console.log("Prompts:", (await client.listPrompts()).prompts.map((p) => p.name));
        console.log("Triage prompt:", JSON.stringify(await client.getPrompt({
            name: "triage-ticket",
            arguments: { ticketText: "После обновления перестала открываться страница профиля" },
        }), null, 2));
    } finally {
        await client.close();
    }
}

main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});