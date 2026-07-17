import type { TodosResponse } from '../types/todo';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export type FetchTodosParams = {
  page?: number;
  limit?: number;
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

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load todos (${response.status})`);
  }

  return response.json() as Promise<TodosResponse>;
}
