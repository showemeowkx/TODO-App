import type { TodosResponse } from '../types/todo';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export async function fetchTodos(): Promise<TodosResponse> {
  const response = await fetch(`${BASE_API_URL}/todo`);

  if (!response.ok) {
    throw new Error(`Failed to load todos (${response.status})`);
  }

  return response.json() as Promise<TodosResponse>;
}
