import assert from "node:assert/strict";
import test from "node:test";

import { getTicketById, getTicketStats, searchTickets } from "../src/services/ticket-service.js";

test("поиск нечувствителен к регистру и ищет в описании", () => {
  const result = searchTickets({ query: "ОШИБКА" });
  assert.ok(result.length >= 2);
  assert.ok(result.some((ticket) => ticket.id === 2));
  assert.equal(searchTickets({ query: "401" })[0]?.id, 1);
});

test("можно фильтровать по статусу и ограничивать количество", () => {
  const result = searchTickets({ query: "не", status: "NEW", limit: 1 });
  assert.equal(result.length, 1);
  assert.equal(result[0]?.status, "NEW");
});

test("getTicketById возвращает существующую заявку и undefined для несуществующей", () => {
  assert.equal(getTicketById(42)?.id, 42);
  assert.equal(getTicketById(999), undefined);
});

test("статистика считает все заявки и все статусы", () => {
  const { total, byStatus } = getTicketStats();
  assert.equal(total, 8);
  assert.equal(Object.values(byStatus).reduce((sum, value) => sum + value, 0), total);
});
