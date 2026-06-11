import { ConfirmPaymentDto, PaymentMethodInput } from './dto/confirm-payment.dto';
import { UnauthorizedException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  const service = {
    create: jest.fn(),
    findByCode: jest.fn(),
    findByPublicToken: jest.fn(),
    payAtTable: jest.fn(),
    findCashierOrders: jest.fn(),
    acceptOrder: jest.fn(),
    rejectOrder: jest.fn(),
    confirmPayment: jest.fn(),
  } as unknown as OrdersService;
  const controller = new OrdersController(service);

  beforeEach(() => jest.clearAllMocks());

  it('delegates create', () => {
    const dto: CreateOrderDto = { tableCode: 'M-01', items: [{ menuId: 1, quantity: 2 }] };
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates find by code', () => {
    controller.findByCode('ORD-1');
    expect(service.findByCode).toHaveBeenCalledWith('ORD-1');
  });

  it('delegates find by public token', () => {
    controller.findByPublicToken('tok-1');
    expect(service.findByPublicToken).toHaveBeenCalledWith('tok-1');
  });

  it('delegates pay at table', () => {
    controller.payAtTable('tok-1');
    expect(service.payAtTable).toHaveBeenCalledWith('tok-1');
  });

  it('delegates cashier order list', () => {
    controller.findCashierOrders();
    expect(service.findCashierOrders).toHaveBeenCalledWith();
  });

  it('delegates accept order', () => {
    controller.acceptOrder(3);
    expect(service.acceptOrder).toHaveBeenCalledWith(3);
  });

  it('delegates reject order', () => {
    const dto = { reason: 'Stok habis' };
    controller.rejectOrder(3, dto);
    expect(service.rejectOrder).toHaveBeenCalledWith(3, dto);
  });

  it('delegates confirm payment', () => {
    const dto: ConfirmPaymentDto = {
      paymentMethod: PaymentMethodInput.CASH,
      amountPaid: 50000,
    };
    controller.confirmPayment(1, dto, { user: { sub: 7, email: 'cashier@test', role: 'CASHIER' } } as any);
    expect(service.confirmPayment).toHaveBeenCalledWith(1, dto, 7);
  });

  it('throws when confirm payment token has no user id', () => {
    const dto: ConfirmPaymentDto = {
      paymentMethod: PaymentMethodInput.CASH,
      amountPaid: 50000,
    };

    expect(() => controller.confirmPayment(1, dto, {} as any)).toThrow(UnauthorizedException);
  });
});
