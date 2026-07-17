/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SortMethods } from '../enums/sortMethods.enum';
import { TodoFilters } from '../enums/todoFilters.enuim';
import { Type } from 'class-transformer';

export class GetTodosDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SortMethods)
  sortMethod?: SortMethods;

  @IsOptional()
  @IsEnum(TodoFilters)
  filter?: TodoFilters;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
