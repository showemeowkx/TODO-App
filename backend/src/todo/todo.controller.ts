import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { GetTodosDto } from './dto/get-todos.dto';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  findAll(@Query() getTodosDto: GetTodosDto): Promise<{
    data: Todo[];
    metadata: { page: number; limit: number; total: number };
  }> {
    return this.todoService.findAll(getTodosDto);
  }

  @Post()
  create(@Body() createTodoDto: CreateTodoDto): Promise<void> {
    return this.todoService.create(createTodoDto);
  }

  @Patch(':id')
  toggleDone(@Param('id') id: number): Promise<void> {
    return this.todoService.toggleDone(id);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.todoService.delete(id);
  }
}
