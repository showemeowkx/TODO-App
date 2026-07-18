import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { SortMethods } from './enums/sortMethods.enum';
import { TodoFilters } from './enums/todoFilters.enum';
import { Todo } from './entities/todo.entity';

describe('TodoController', () => {
  let controller: TodoController;

  const findAll = jest.fn<(...args: any[]) => any>();
  const create = jest.fn<(...args: any[]) => any>();
  const toggleDone = jest.fn<(...args: any[]) => any>();
  const remove = jest.fn<(...args: any[]) => any>();

  const sampleTodos: Todo[] = [
    {
      id: 1,
      title: 'Buy groceries',
      isDone: false,
      priority: 3,
      dueDate: null as unknown as Date,
      createdAt: new Date('2026-07-17T18:46:41.838Z'),
    },
    {
      id: 2,
      title: 'Finish Nest API',
      isDone: false,
      priority: 10,
      dueDate: new Date('2026-07-25'),
      createdAt: new Date('2026-07-17T18:46:58.338Z'),
    },
  ];

  beforeEach(async () => {
    findAll.mockReset();
    create.mockReset();
    toggleDone.mockReset();
    remove.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: {
            findAll,
            create,
            toggleDone,
            delete: remove,
          },
        },
      ],
    }).compile();

    controller = module.get(TodoController);
  });

  describe('GET /todo (findAll)', () => {
    it('returns paginated list (default list scenario)', async () => {
      findAll.mockResolvedValue({
        data: sampleTodos,
        metadata: { page: 1, limit: 10, total: 2 },
      });

      const result = await controller.findAll({});

      expect(findAll).toHaveBeenCalledWith({});
      expect(result.data).toHaveLength(2);
      expect(result.metadata).toEqual({ page: 1, limit: 10, total: 2 });
    });

    it('passes search query param', async () => {
      findAll.mockResolvedValue({
        data: [sampleTodos[1]],
        metadata: { page: 1, limit: 10, total: 1 },
      });

      await controller.findAll({ search: 'Nest' });

      expect(findAll).toHaveBeenCalledWith({ search: 'Nest' });
    });

    it('passes filter=done', async () => {
      findAll.mockResolvedValue({
        data: [],
        metadata: { page: 1, limit: 10, total: 0 },
      });

      await controller.findAll({ filter: TodoFilters.DONE });

      expect(findAll).toHaveBeenCalledWith({
        filter: TodoFilters.DONE,
      });
    });

    it('passes filter=undone', async () => {
      await controller.findAll({ filter: TodoFilters.UNDONE });

      expect(findAll).toHaveBeenCalledWith({
        filter: TodoFilters.UNDONE,
      });
    });

    it('passes sortMethod=priorityAsc', async () => {
      await controller.findAll({ sortMethod: SortMethods.PRIORITY_ASC });

      expect(findAll).toHaveBeenCalledWith({
        sortMethod: SortMethods.PRIORITY_ASC,
      });
    });

    it('passes sortMethod=priorityDesc', async () => {
      await controller.findAll({ sortMethod: SortMethods.PRIORITY_DESC });

      expect(findAll).toHaveBeenCalledWith({
        sortMethod: SortMethods.PRIORITY_DESC,
      });
    });

    it('passes pagination page and limit', async () => {
      findAll.mockResolvedValue({
        data: [sampleTodos[0]],
        metadata: { page: 2, limit: 2, total: 5 },
      });

      const result = await controller.findAll({ page: 2, limit: 2 });

      expect(findAll).toHaveBeenCalledWith({ page: 2, limit: 2 });
      expect(result.metadata.page).toBe(2);
      expect(result.metadata.limit).toBe(2);
    });

    it('passes combined search + filter + sort', async () => {
      await controller.findAll({
        search: 'e',
        filter: TodoFilters.UNDONE,
        sortMethod: SortMethods.PRIORITY_DESC,
      });

      expect(findAll).toHaveBeenCalledWith({
        search: 'e',
        filter: TodoFilters.UNDONE,
        sortMethod: SortMethods.PRIORITY_DESC,
      });
    });

    it('returns empty list when search has no matches', async () => {
      findAll.mockResolvedValue({
        data: [],
        metadata: { page: 1, limit: 10, total: 0 },
      });

      const result = await controller.findAll({ search: 'zzzznotfound' });

      expect(result.data).toEqual([]);
      expect(result.metadata.total).toBe(0);
    });
  });

  describe('POST /todo (create)', () => {
    it('creates a todo with title and priority', async () => {
      create.mockResolvedValue(undefined);

      await controller.create({ title: 'Buy groceries', priority: 3 });

      expect(create).toHaveBeenCalledWith({
        title: 'Buy groceries',
        priority: 3,
      });
    });

    it('creates a todo without priority (default on entity)', async () => {
      create.mockResolvedValue(undefined);

      await controller.create({
        title: 'Quick reminder note',
        priority: undefined as unknown as number,
      });

      expect(create).toHaveBeenCalled();
    });

    it('creates a todo with dueDate', async () => {
      create.mockResolvedValue(undefined);

      await controller.create({
        title: 'Submit project report',
        priority: 8,
        dueDate: '2026-07-25',
      });

      expect(create).toHaveBeenCalledWith({
        title: 'Submit project report',
        priority: 8,
        dueDate: '2026-07-25',
      });
    });
  });

  describe('PATCH /todo/:id (toggleDone)', () => {
    it('toggles done for an existing todo', async () => {
      toggleDone.mockResolvedValue(undefined);

      await controller.toggleDone(1);

      expect(toggleDone).toHaveBeenCalledWith(1);
    });

    it('propagates NotFoundException for missing id', async () => {
      toggleDone.mockRejectedValue(new NotFoundException('Todo not found'));

      await expect(controller.toggleDone(999999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('DELETE /todo/:id (delete)', () => {
    it('deletes an existing todo', async () => {
      remove.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(remove).toHaveBeenCalledWith(1);
    });

    it('propagates NotFoundException when deleting missing id', async () => {
      remove.mockRejectedValue(new NotFoundException('Todo not found'));

      await expect(controller.delete(999999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
