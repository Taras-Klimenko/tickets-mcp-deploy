import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

import { TICKET_STATUSES } from '../data/tickets.js';
import { getTicketById, searchTickets } from '../services/ticket-service.js';

export function registerTools(server: McpServer): void {

    server.registerTool("search_tickets", {
        title: 'Поиск заявок',
        description: "Найти заявки по тексту в заголовке или описании. " +
            "Используй, если пользователь ищет обращение, но не знает его номер. " +
            "Возвращает максимум 50 заявок, от новых к старым. " +
            "Если известен ID, используй get_ticket.",

        annotations: { readOnlyHint: true, destructiveHint: false },
        inputSchema: z.object({
            query: z.string().trim().min(2).max(100).describe("Текст для поиска, 2–100 символов; сравнение без учёта регистра."),
            status: z.enum(TICKET_STATUSES).optional().describe("Статус заявки, если известен; игнорируется, если не указан."),
            limit: z.number().int().min(1).max(50).describe('Максимальное число результатов (по умолчанию 20).')
        })
    }, async ({ query, status, limit }) => {
        const found = searchTickets({ query, status, limit })

        return {
            content: [{ type: 'text' as const, text: JSON.stringify(found, null, 2) }]
        }
    }
    )

    server.registerTool(
        "get_ticket",
        {
            title: "Получить заявку по ID",
            description:
                "Получить одну заявку по её точному числовому ID. " +
                "Используй, когда пользователь называет номер заявки, например 42. " +
                "Возвращает поля заявки или понятную ошибку, если такой ID не существует. " +
                "Для поиска по тексту используй search_tickets.",
            annotations: { readOnlyHint: true, destructiveHint: false },
            inputSchema: z.object({
                ticketId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).describe(
                    "Положительный целочисленный идентификатор заявки.",
                ),
            }),
        },
        async ({ ticketId }) => {
            const ticket = getTicketById(ticketId);
            if (!ticket) {
                // Ошибка бизнес-операции, НЕ падение процесса и НЕ ошибка JSON-RPC.
                return {
                    isError: true,
                    content: [{ type: "text" as const, text: `Заявка #${ticketId} не найдена.` }],
                };
            }
            return {
                content: [{ type: "text" as const, text: JSON.stringify(ticket, null, 2) }],
            };
        },
    );
}