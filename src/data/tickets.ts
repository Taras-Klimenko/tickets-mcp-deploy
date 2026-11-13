export const TICKET_STATUSES = [
    "NEW",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELED",
  ] as const;
  
  export type TicketStatus = (typeof TICKET_STATUSES)[number];
  
  export interface Ticket {
    id: number;
    title: string;
    description: string;
    status: TicketStatus;
    createdAt: string;
  }
  
  export const tickets: readonly Ticket[] = [
    {
      id: 1,
      title: "Не работает авторизация",
      description: "После ввода пароля приложение возвращает ошибку 401",
      status: "NEW",
      createdAt: "2026-11-04T09:00:00Z",
    },
    {
      id: 2,
      title: "Ошибка при загрузке файла",
      description: "Загрузка изображений иногда завершается кодом 500",
      status: "IN_PROGRESS",
      createdAt: "2026-11-05T12:30:00Z",
    },
    {
      id: 3,
      title: "Не приходит письмо подтверждения",
      description: "Пользователь не получает письмо после регистрации",
      status: "NEW",
      createdAt: "2026-11-06T08:10:00Z",
    },
    {
      id: 4,
      title: "Проблема с отображением аватара",
      description: "Аватар обрезается на мобильном устройстве",
      status: "COMPLETED",
      createdAt: "2026-11-07T11:50:00Z",
    },
    {
      id: 5,
      title: "Ошибка при сохранении формы",
      description: "После отправки форма остаётся без ответа",
      status: "CANCELED",
      createdAt: "2026-11-08T13:20:00Z",
    },
    {
      id: 6,
      title: "Не открывается страница статистики",
      description: "Панель аналитики показывает пустой экран",
      status: "IN_PROGRESS",
      createdAt: "2026-11-09T14:10:00Z",
    },
    {
      id: 7,
      title: "Не работает поиск по заявкам",
      description: "Поиск заявок не учитывает регистр и иногда пропускает результаты",
      status: "NEW",
      createdAt: "2026-11-10T16:05:00Z",
    },
    {
      id: 42,
      title: "Не открывается страница профиля",
      description: "После обновления приложения профиль стал недоступен",
      status: "COMPLETED",
      createdAt: "2026-11-11T10:20:00Z",
    },
  ];