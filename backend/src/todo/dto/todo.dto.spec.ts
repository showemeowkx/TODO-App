import 'reflect-metadata';
import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTodoDto } from './create-todo.dto';
import { GetTodosDto } from './get-todos.dto';
import { SortMethods } from '../enums/sortMethods.enum';
import { TodoFilters } from '../enums/todoFilters.enuim';

describe('CreateTodoDto validation', () => {
  async function validateDto(plain: Record<string, unknown>) {
    const dto = plainToInstance(CreateTodoDto, plain);
    return validate(dto);
  }

  it('accepts valid title and priority', async () => {
    const errors = await validateDto({
      title: 'Buy groceries',
      priority: 3,
    });
    expect(errors).toHaveLength(0);
  });

  it('accepts title without priority', async () => {
    const errors = await validateDto({ title: 'Quick reminder note' });
    expect(errors).toHaveLength(0);
  });

  it('accepts optional dueDate ISO string', async () => {
    const errors = await validateDto({
      title: 'Submit project report',
      priority: 8,
      dueDate: '2026-07-25',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects title that is too short (min 3)', async () => {
    const errors = await validateDto({ title: 'ab' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('rejects missing title', async () => {
    const errors = await validateDto({});
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('rejects priority greater than 10', async () => {
    const errors = await validateDto({
      title: 'Bad priority',
      priority: 99,
    });
    expect(errors.some((e) => e.property === 'priority')).toBe(true);
  });

  it('rejects priority less than 1', async () => {
    const errors = await validateDto({
      title: 'Bad priority low',
      priority: 0,
    });
    expect(errors.some((e) => e.property === 'priority')).toBe(true);
  });

  it('rejects invalid dueDate string', async () => {
    const errors = await validateDto({
      title: 'Invalid date todo',
      dueDate: 'not-a-date',
    });
    expect(errors.some((e) => e.property === 'dueDate')).toBe(true);
  });
});

describe('GetTodosDto validation', () => {
  async function validateDto(plain: Record<string, unknown>) {
    const dto = plainToInstance(GetTodosDto, plain);
    return validate(dto);
  }

  it('accepts empty query', async () => {
    const errors = await validateDto({});
    expect(errors).toHaveLength(0);
  });

  it('accepts search, filter, sort, and pagination', async () => {
    const errors = await validateDto({
      search: 'Nest',
      filter: TodoFilters.DONE,
      sortMethod: SortMethods.PRIORITY_ASC,
      page: 1,
      limit: 2,
    });
    expect(errors).toHaveLength(0);
  });

  it('transforms string page/limit to numbers', async () => {
    const dto = plainToInstance(GetTodosDto, { page: '1', limit: '2' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(2);
  });

  it('rejects invalid sortMethod', async () => {
    const errors = await validateDto({ sortMethod: 'nope' });
    expect(errors.some((e) => e.property === 'sortMethod')).toBe(true);
  });

  it('rejects invalid filter', async () => {
    const errors = await validateDto({ filter: 'all' });
    expect(errors.some((e) => e.property === 'filter')).toBe(true);
  });

  it('rejects page less than 1', async () => {
    const errors = await validateDto({ page: 0 });
    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });
});
