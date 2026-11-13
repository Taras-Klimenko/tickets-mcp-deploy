import {
    tickets,
    TICKET_STATUSES,
    type Ticket,
    type TicketStatus,
} from "../data/tickets.js";

export interface SearchTicketsOptions {
    query: string;
    status?: TicketStatus;
    limit?: number;
}

export function searchTickets({ query, status, limit = 20 }: SearchTicketsOptions): Ticket[] {

    const term = query.trim().toLocaleLowerCase('ru-RU');

    return tickets
        .filter(ticket => {
            const haystack = `${ticket.title} ${ticket.description}`.toLocaleLowerCase('ru-RU');
            return haystack.includes(term) && (!status || ticket.status === status);
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit)
}

export function getTicketById(id: number): Ticket | undefined {
    return tickets.find(ticket => ticket.id === id);
}

export function getTicketStats(): { total: number, byStatus: Record<TicketStatus, number> } {
    const byStatus = Object.fromEntries(TICKET_STATUSES.map(status => [status, 0])) as Record<TicketStatus, number>;

    for (const ticket of tickets) {
        byStatus[ticket.status] += 1;
    }

    return { total: tickets.length, byStatus }
}