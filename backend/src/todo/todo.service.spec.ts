import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { SortMethods } from './enums/sortMethods.enum';
import { TodoFilters } from './enums/todoFilters.enum';

describe('TodoService', () => {
  let service: TodoService;

  const create = jest.fn<(...args: any[]) => any>();
  const save = jest.fn<(...args: any[]) => any>();
  const findOne = jest.fn<(...args: any[]) => any>();
  const remove = jest.fn<(...args: any[]) => any>();
  const createQueryBuilder = jest.fn<(...args: any[]) => any>();

  const andWhere = jest.fn<(...args: any[]) => any>();
  const orderBy = jest.fn<(...args: any[]) => any>();
  const skip = jest.fn<(...args: any[]) => any>();
  const take = jest.fn<(...args: any[]) => any>();
  const getManyAndCount = jest.fn<(...args: any[]) => any>();

  const todo: Todo = {
    id: 1,
    title: 'Buy groceries',
    isDone: false,
    priority: 3,
    dueDate: null as unknown as Date,
    createdAt: new Date('2026-07-17T18:46:41.838Z'),
  };

  beforeEach(async () => {
    create.mockReset();
    save.mockReset();
    findOne.mockReset();
    remove.mockReset();
    createQueryBuilder.mockReset();
    andWhere.mockReset();
    orderBy.mockReset();
    skip.mockReset();
    take.mockReset();
    getManyAndCount.mockReset();

    const qb = {
      andWhere,
      orderBy,
      skip,
      take,
      getManyAndCount,
    };

    andWhere.mockImplementation(() => qb);
    orderBy.mockImplementation(() => qb);
    skip.mockImplementation(() => qb);
    take.mockImplementation(() => qb);
    getManyAndCount.mockResolvedValue([[todo], 1]);
    createQueryBuilder.mockReturnValue(qb);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useValue: {
            create,
            save,
            findOne,
            delete: remove,
            createQueryBuilder,
          },
        },
      ],
    }).compile();

    service = module.get(TodoService);
  });

  describe('create', () => {
    it('creates a todo with title and priority', async () => {
      create.mockReturnValue(todo);
      save.mockResolvedValue(todo);

      await service.create({ title: 'Buy groceries', priority: 3 });

      expect(create).toHaveBeenCalledWith({
        title: 'Buy groceries',
        priority: 3,
        dueDate: undefined,
      });
      expect(save).toHaveBeenCalledWith(todo);
    });

    it('converts dueDate string to Date', async () => {
      create.mockReturnValue(todo);
      save.mockResolvedValue(todo);

      await service.create({
        title: 'Submit project report',
        priority: 8,
        dueDate: '2026-07-25',
      });

      expect(create).toHaveBeenCalledWith({
        title: 'Submit project report',
        priority: 8,
        dueDate: new Date('2026-07-25'),
      });
    });
  });

  describe('findAll', () => {
    it('lists todos with default page/limit and createdAt DESC', async () => {
      const result = await service.findAll({});

      expect(createQueryBuilder).toHaveBeenCalledWith('todo');
      expect(orderBy).toHaveBeenCalledWith('todo.createdAt', 'DESC');
      expect(skip).toHaveBeenCalledWith(0);
      expect(take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: [todo],
        metadata: { page: 1, limit: 10, total: 1 },
      });
    });

    it('applies case-insensitive search', async () => {
      await service.findAll({ search: 'Nest' });

      expect(andWhere).toHaveBeenCalledWith(
        'LOWER(todo.title) LIKE LOWER(:search)',
        { search: '%Nest%' },
      );
    });

    it('filters by done status', async () => {
      await service.findAll({ filter: TodoFilters.DONE });

      expect(andWhere).toHaveBeenCalledWith('todo.isDone = :isDone', {
        isDone: true,
      });
    });

    it('filters by undone status', async () => {
      await service.findAll({ filter: TodoFilters.UNDONE });

      expect(andWhere).toHaveBeenCalledWith('todo.isDone = :isDone', {
        isDone: false,
      });
    });

    it('sorts by priority ascending', async () => {
      await service.findAll({ sortMethod: SortMethods.PRIORITY_ASC });

      expect(orderBy).toHaveBeenCalledWith('todo.priority', 'ASC');
    });

    it('sorts by priority descending', async () => {
      await service.findAll({ sortMethod: SortMethods.PRIORITY_DESC });

      expect(orderBy).toHaveBeenCalledWith('todo.priority', 'DESC');
    });

    it('sorts by due date ascending with NULLS LAST', async () => {
      await service.findAll({ sortMethod: SortMethods.DUE_DATE_ASC });

      expect(orderBy).toHaveBeenCalledWith('todo.dueDate', 'ASC', 'NULLS LAST');
    });

    it('sorts by due date descending with NULLS LAST', async () => {
      await service.findAll({ sortMethod: SortMethods.DUE_DATE_DESC });

      expect(orderBy).toHaveBeenCalledWith(
        'todo.dueDate',
        'DESC',
        'NULLS LAST',
      );
    });

    it('applies pagination page=2&limit=2', async () => {
      await service.findAll({ page: 2, limit: 2 });

      expect(skip).toHaveBeenCalledWith(2);
      expect(take).toHaveBeenCalledWith(2);
    });

    it('combines search and filter with andWhere (no overwrite)', async () => {
      await service.findAll({
        search: 'Water',
        filter: TodoFilters.DONE,
      });

      expect(andWhere).toHaveBeenCalledTimes(2);
      expect(andWhere).toHaveBeenNthCalledWith(
        1,
        'LOWER(todo.title) LIKE LOWER(:search)',
        { search: '%Water%' },
      );
      expect(andWhere).toHaveBeenNthCalledWith(2, 'todo.isDone = :isDone', {
        isDone: true,
      });
    });
  });

  describe('findOne', () => {
    it('returns a todo when found', async () => {
      findOne.mockResolvedValue(todo);

      await expect(service.findOne(1)).resolves.toEqual(todo);
    });

    it('throws NotFoundException when missing', async () => {
      findOne.mockResolvedValue(null);

      await expect(service.findOne(999999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('toggleDone', () => {
    it('flips isDone from false to true', async () => {
      const entity = { ...todo, isDone: false };
      findOne.mockResolvedValue(entity);
      save.mockResolvedValue({ ...entity, isDone: true });

      await service.toggleDone(1);

      expect(entity.isDone).toBe(true);
      expect(save).toHaveBeenCalledWith(entity);
    });

    it('flips isDone from true to false', async () => {
      const entity = { ...todo, isDone: true };
      findOne.mockResolvedValue(entity);
      save.mockResolvedValue({ ...entity, isDone: false });

      await service.toggleDone(1);

      expect(entity.isDone).toBe(false);
      expect(save).toHaveBeenCalledWith(entity);
    });

    it('throws when toggling a missing todo', async () => {
      findOne.mockResolvedValue(null);

      await expect(service.toggleDone(999999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deletes an existing todo', async () => {
      findOne.mockResolvedValue(todo);
      remove.mockResolvedValue({ affected: 1, raw: [] });

      await service.delete(1);

      expect(remove).toHaveBeenCalledWith(1);
    });

    it('throws when deleting a missing todo', async () => {
      findOne.mockResolvedValue(null);

      await expect(service.delete(999999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(remove).not.toHaveBeenCalled();
    });
  });
});
