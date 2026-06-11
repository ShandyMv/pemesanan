import { Type } from 'class-transformer';
import { IsEnum, IsNumber, Min } from 'class-validator';

export enum PaymentMethodInput {
  CASH = 'cash',
  CASHLESS = 'cashless',
}

export class ConfirmPaymentDto {
  @IsEnum(PaymentMethodInput)
  paymentMethod: PaymentMethodInput;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amountPaid: number;
}
