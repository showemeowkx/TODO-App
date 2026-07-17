export type Todo = {
  id: number;
  title: string;
  isDone: boolean;
  priority: number;
  dueDate: string | null;
  createdAt: string;
};

export const SortMethods = {
  PRIORITY_ASC: "priorityAsc",
  PRIORITY_DESC: "priorityDesc",
  DUE_DATE_ASC: "dueDateAsc",
  DUE_DATE_DESC: "dueDateDesc",
} as const;

export type SortMethod = (typeof SortMethods)[keyof typeof SortMethods];

export const TodoFilters = {
  UNDONE: "undone",
  DONE: "done",
} as const;

export type TodoFilter = (typeof TodoFilters)[keyof typeof TodoFilters];

export type TodosResponse = {
  data: Todo[];
  metadata: {
    page: number;
    limit: number;
    total: number;
  };
};

export type CreateTodoDto = {
  title: string;
  priority?: number;
  dueDate?: string;
};
