import { type McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import { getTicketById, getTicketStats } from "../services/ticket-service.js";

/** Resources читает клиент/Host: это данные для контекста, а не решение модели. */
export function registerResources(server: McpServer): void {
    server.registerResource(
        "ticket-stats",
        "stats://tickets/summary",
        {
            title: "Сводка по заявкам",
            description: "Общее количество заявок и распределение по статусам.",
            mimeType: "application/json",
        },
        async (uri) => ({
            contents: [{
                uri: uri.href,
                mimeType: "application/json",
                text: JSON.stringify(getTicketStats(), null, 2),
            }],
        }),
    );

    // URI-шаблон регистрируется отдельно. Список экземпляров здесь не перечисляется.
    server.registerResource(
        "ticket",
        new ResourceTemplate("ticket://{ticketId}", { list: undefined }),
        {
            title: "Данные конкретной заявки",
            description: "Прочитать одну заявку по URI ticket://{ticketId}.",
            mimeType: "application/json",
        },
        async (uri, { ticketId }) => {
            // Переменные шаблонов URI — недоверенный ввод.
            const id = Number(ticketId);
            if (!Number.isSafeInteger(id) || id <= 0) {
                throw new Error("Некорректный идентификатор заявки в URI.");
            }
            const ticket = getTicketById(id);
            if (!ticket) {
                throw new Error(`Заявка #${id} не найдена.`);
            }
            return {
                contents: [{
                    uri: uri.href,
                    mimeType: "application/json",
                    text: JSON.stringify(ticket, null, 2),
                }],
            };
        },
    );
}
