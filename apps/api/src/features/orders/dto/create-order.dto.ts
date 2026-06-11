import { Type } from 'class-transformer';
import { ArrayMinSize, IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  menuId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class CreateOrderDto {
  @IsString()
  @MaxLength(80)
  tableCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  customerName?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1)
  items: CreateOrderItemDto[];
}
