import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Todo } from './entities/todo.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<void> {
    const todo = this.todoRepository.create(createTodoDto);
    await this.todoRepository.save(todo);
    this.logger.log(`Todo created: ${todo.id}`);
  }

  async findAll(): Promise<Todo[]> {
    return this.todoRepository.find();
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
