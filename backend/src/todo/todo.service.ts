import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Todo } from './entities/todo.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { GetTodosDto } from './dto/get-todos.dto';
import { TodoFilters } from './enums/todoFilters.enum';
import { SortMethods } from './enums/sortMethods.enum';

@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<void> {
    const todo = this.todoRepository.create({
      title: createTodoDto.title,
      priority: createTodoDto.priority,
      dueDate: createTodoDto.dueDate
        ? new Date(createTodoDto.dueDate)
        : undefined,
    });
    await this.todoRepository.save(todo);

    this.logger.log(`Todo created: ${todo.id}`);
  }

  async findAll(getTodosDto: GetTodosDto): Promise<{
    data: Todo[];
    metadata: { page: number; limit: number; total: number };
  }> {
    const qb = this.todoRepository.createQueryBuilder('todo');

    if (getTodosDto.search) {
      qb.andWhere('LOWER(todo.title) LIKE LOWER(:search)', {
        search: `%${getTodosDto.search}%`,
      });
    }

    if (getTodosDto.filter) {
      qb.andWhere('todo.isDone = :isDone', {
        isDone: getTodosDto.filter === TodoFilters.DONE,
      });
    }

    if (getTodosDto.sortMethod) {
      switch (getTodosDto.sortMethod) {
        case SortMethods.PRIORITY_ASC:
          qb.orderBy('todo.priority', 'ASC');
          break;
        case SortMethods.PRIORITY_DESC:
          qb.orderBy('todo.priority', 'DESC');
          break;
        case SortMethods.DUE_DATE_ASC:
          qb.orderBy('todo.dueDate', 'ASC', 'NULLS LAST');
          break;
        case SortMethods.DUE_DATE_DESC:
          qb.orderBy('todo.dueDate', 'DESC', 'NULLS LAST');
          break;
      }
    } else {
      qb.orderBy('todo.createdAt', 'DESC');
    }

    let page = 1;
    let limit = 10;

    if (getTodosDto.page) {
      page = getTodosDto.page;
    }

    if (getTodosDto.limit) {
      limit = getTodosDto.limit;
    }

    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [todos, total] = await qb.getManyAndCount();

    return { data: todos, metadata: { page, limit, total } };
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });

    if (!todo) {
      this.logger.error(`Todo not found: ${id}`);
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async toggleDone(id: number): Promise<void> {
    const todo = await this.findOne(id);

    todo.isDone = !todo.isDone;
    await this.todoRepository.save(todo);

    this.logger.log(`Todo toggled: ${todo.id}`);
  }

  async delete(id: number): Promise<void> {
    const todo = await this.findOne(id);
    await this.todoRepository.delete(id);

    this.logger.log(`Todo deleted: ${todo.id}`);
  }
}
