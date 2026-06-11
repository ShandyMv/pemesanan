import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTableDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  tableNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  qrCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
