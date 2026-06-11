import { IsDateString, IsOptional } from 'class-validator';

export class TransactionsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
