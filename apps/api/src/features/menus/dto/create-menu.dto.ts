import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class CreateMenuDto {
  @IsInt()
  categoryId: number;

  @IsString()
  @MaxLength(140)
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(1)
  price: number;

  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  imageUrl: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
