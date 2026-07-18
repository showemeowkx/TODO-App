import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priority: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
