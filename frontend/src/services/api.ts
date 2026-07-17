import type {
  CreateTodoDto,
  SortMethod,
  TodoFilter,
  TodosResponse,
} from '../types/todo';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export type FetchTodosParams = {
  page?: number;
  limit?: number;
  search?: string;
  filter?: TodoFilter;
  sortMethod?: SortMethod;
};

export async function fetchTodos(
  params: FetchTodosParams = {},
): Promise<TodosResponse> {
  const url = new URL(`${BASE_API_URL}/todo`);

  if (params.page != null) {
    url.searchParams.set('page', String(params.page));
  }
  if (params.limit != null) {
    url.searchParams.set('limit', String(params.limit));
  }
  if (params.search) {
    url.searchParams.set('search', params.search);
  }
  if (params.filter) {
    url.searchParams.set('filter', params.filter);
  }
  if (params.sortMethod) {
    url.searchParams.set('sortMethod', params.sortMethod);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load todos (${response.status})`);
  }

  return response.json() as Promise<TodosResponse>;
}

export async function createTodo(payload: CreateTodoDto): Promise<void> {
  const body: CreateTodoDto = {
    title: payload.title,
  };

  if (payload.priority != null) {
    body.priority = payload.priority;
  }

  if (payload.dueDate) {
    body.dueDate = payload.dueDate;
  }

  const response = await fetch(`${BASE_API_URL}/todo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to create todo (${response.status})`);
  }
}

export async function toggleTodo(id: number): Promise<void> {
  const response = await fetch(`${BASE_API_URL}/todo/${id}`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error(`Failed to toggle todo (${response.status})`);
  }
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${BASE_API_URL}/todo/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete todo (${response.status})`);
  }
}
