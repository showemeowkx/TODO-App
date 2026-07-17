import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  findAll(): Promise<Todo[]> {
    return this.todoService.findAll();
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
