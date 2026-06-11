import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PaymentMethodInput } from './dto/confirm-payment.dto';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const tx = {
    order: {
      create: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
  };
  const prisma: any = {
    cafeTable: {
      findFirst: jest.fn(),
    },
    menu: {
      findMany: jest.fn(),
    },
    order: {
      count: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback: (transaction: typeof tx) => unknown) => callback(tx)),
  };
  const service = new OrdersService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('throws when table is invalid', async () => {
    prisma.cafeTable.findFirst.mockResolvedValue(null);

    await expect(service.create({ tableCode: 'M-99', items: [{ menuId: 1, quantity: 1 }] })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws when a menu is unavailable', async () => {
    prisma.cafeTable.findFirst.mockResolvedValue({ id: 1 });
    prisma.menu.findMany.mockResolvedValue([]);

    await expect(service.create({ tableCode: 'M-01', items: [{ menuId: 1, quantity: 1 }] })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates order with default customer name', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-31T10:15:00+07:00'));
    prisma.cafeTable.findFirst.mockResolvedValue({ id: 1 });
    prisma.menu.findMany.mockResolvedValue([{ id: 1, price: 25000 }]);
    prisma.order.count.mockResolvedValue(2);
    tx.order.create.mockResolvedValue({ id: 10 });

    await expect(service.create({ tableCode: 'm-01', items: [{ menuId: 1, quantity: 2 }] })).resolves.toEqual({ id: 10 });
    expect(tx.order.create).toHaveBeenCalledWith({
      data: {
        tableId: 1,
        orderCode: 'ORD-260531-003',
        publicToken: expect.any(String),
        customerName: 'Customer',
        totalAmount: 50000,
        status: OrderStatus.PENDING,
        orderedAt: new Date('2026-05-31T03:15:00.000Z'),
        items: {
          create: [{ menuId: 1, quantity: 2, price: 25000, subtotal: 50000, note: undefined }],
        },
      },
      include: expect.any(Object),
    });
  });

  it('creates order with provided customer name and note', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-31T11:00:00+07:00'));
    prisma.cafeTable.findFirst.mockResolvedValue({ id: 2 });
    prisma.menu.findMany.mockResolvedValue([{ id: 3, price: 18000 }]);
    prisma.order.count.mockResolvedValue(0);
    tx.order.create.mockResolvedValue({ id: 11 });

    await service.create({
      tableCode: 'QR-M-02',
      customerName: ' Dafa ',
      items: [{ menuId: 3, quantity: 1, note: 'less ice' }],
    });

    expect(tx.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tableId: 2,
        customerName: 'Dafa',
        totalAmount: 18000,
        items: {
          create: [{ menuId: 3, quantity: 1, price: 18000, subtotal: 18000, note: 'less ice' }],
        },
      }),
      include: expect.any(Object),
    });
  });

  it('finds order by code', async () => {
    const order = { id: 1, orderCode: 'ORD-1' };
    prisma.order.findUnique.mockResolvedValue(order);

    await expect(service.findByCode(' ord-1 ')).resolves.toBe(order);
    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { orderCode: 'ORD-1' },
      include: expect.any(Object),
    });
  });

  it('throws when order code is not found', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(service.findByCode('ORD-MISSING')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('finds cashier orders', async () => {
    await service.findCashierOrders();
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      include: expect.any(Object),
      orderBy: { orderedAt: 'desc' },
    });
  });

  it('throws when payment order is not found', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(
      service.confirmPayment(1, { paymentMethod: PaymentMethodInput.CASH, amountPaid: 50000 }, 1),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when order is not pending', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 1, status: OrderStatus.PAID, totalAmount: 10000 });

    await expect(
      service.confirmPayment(1, { paymentMethod: PaymentMethodInput.CASH, amountPaid: 50000 }, 1),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when amount is lower than total', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 1, status: OrderStatus.PENDING, totalAmount: 50000 });

    await expect(
      service.confirmPayment(1, { paymentMethod: PaymentMethodInput.CASH, amountPaid: 40000 }, 1),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when cashless amount is different from total', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 1, status: OrderStatus.PENDING, totalAmount: 50000 });

    await expect(
      service.confirmPayment(1, { paymentMethod: PaymentMethodInput.CASHLESS, amountPaid: 60000 }, 1),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('confirms cash payment and computes change', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-31T12:00:00+07:00'));
    prisma.order.findUnique.mockResolvedValue({ id: 1, status: OrderStatus.PENDING, totalAmount: 50000 });
    tx.order.update.mockResolvedValue({ id: 1, status: OrderStatus.PAID });

    await expect(
      service.confirmPayment(1, { paymentMethod: PaymentMethodInput.CASH, amountPaid: 60000 }, 7),
    ).resolves.toEqual({ id: 1, status: OrderStatus.PAID });
    expect(tx.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: 1,
        cashierId: 7,
        amountPaid: 60000,
        changeAmount: 10000,
        paymentMethod: 'CASH',
        paymentChannel: 'CASHIER',
        paymentStatus: 'PAID',
        paidAt: new Date('2026-05-31T05:00:00.000Z'),
      },
    });
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.PAID, paidAt: new Date('2026-05-31T05:00:00.000Z') },
      include: expect.any(Object),
    });
  });

  it('confirms exact cashless payment without change', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 2, status: OrderStatus.PENDING, totalAmount: 50000 });
    tx.order.update.mockResolvedValue({ id: 2, status: OrderStatus.PAID });

    await service.confirmPayment(2, { paymentMethod: PaymentMethodInput.CASHLESS, amountPaid: 50000 }, 7);

    expect(tx.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 2,
        changeAmount: 0,
        paymentMethod: 'CASHLESS',
        paymentChannel: 'CASHIER',
      }),
    });
  });

  it('confirms cashier payment for an order already awaiting payment', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 5, status: OrderStatus.AWAITING_PAYMENT, totalAmount: 30000 });
    tx.order.update.mockResolvedValue({ id: 5, status: OrderStatus.PAID });

    await expect(
      service.confirmPayment(5, { paymentMethod: PaymentMethodInput.CASH, amountPaid: 30000 }, 9),
    ).resolves.toEqual({ id: 5, status: OrderStatus.PAID });
  });

  it('finds order by public token', async () => {
    const order = { id: 3, publicToken: 'tok-3' };
    prisma.order.findUnique.mockResolvedValue(order);

    await expect(service.findByPublicToken(' tok-3 ')).resolves.toBe(order);
    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { publicToken: 'tok-3' },
      include: expect.any(Object),
    });
  });

  it('throws when public token order is not found', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(service.findByPublicToken('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('accepts a pending order', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 1, status: OrderStatus.PENDING });
    prisma.order.update.mockResolvedValue({ id: 1, status: OrderStatus.AWAITING_PAYMENT });

    await expect(service.acceptOrder(1)).resolves.toEqual({ id: 1, status: OrderStatus.AWAITING_PAYMENT });
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.AWAITING_PAYMENT },
      include: expect.any(Object),
    });
  });

  it('throws when accepting a missing order', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(service.acceptOrder(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when accepting an order that is not pending', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 1, status: OrderStatus.PAID });

    await expect(service.acceptOrder(1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a pending order with a provided reason', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 1, status: OrderStatus.PENDING });
    prisma.order.update.mockResolvedValue({ id: 1, status: OrderStatus.REJECTED });

    await service.rejectOrder(1, { reason: '  Stok kopi habis  ' });

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.REJECTED, rejectedReason: 'Stok kopi habis' },
      include: expect.any(Object),
    });
  });

  it('rejects an awaiting-payment order with a default reason', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 2, status: OrderStatus.AWAITING_PAYMENT });
    prisma.order.update.mockResolvedValue({ id: 2, status: OrderStatus.REJECTED });

    await service.rejectOrder(2, {});

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { status: OrderStatus.REJECTED, rejectedReason: 'Menu tidak tersedia.' },
      include: expect.any(Object),
    });
  });

  it('throws when rejecting a missing order', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(service.rejectOrder(1, {})).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when rejecting an order that is already paid', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 1, status: OrderStatus.PAID });

    await expect(service.rejectOrder(1, {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('settles a self-table cashless payment', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-31T12:00:00+07:00'));
    prisma.order.findUnique.mockResolvedValue({ id: 4, status: OrderStatus.AWAITING_PAYMENT, totalAmount: 30000 });
    tx.order.update.mockResolvedValue({ id: 4, status: OrderStatus.PAID });

    await expect(service.payAtTable('tok-4')).resolves.toEqual({ id: 4, status: OrderStatus.PAID });
    expect(tx.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: 4,
        cashierId: null,
        amountPaid: 30000,
        changeAmount: 0,
        paymentMethod: 'CASHLESS',
        paymentChannel: 'SELF_TABLE',
        paymentStatus: 'PAID',
        paidAt: new Date('2026-05-31T05:00:00.000Z'),
      },
    });
  });

  it('throws when paying a missing public token order', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(service.payAtTable('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when paying an order that is not awaiting payment', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 4, status: OrderStatus.PENDING, totalAmount: 30000 });

    await expect(service.payAtTable('tok-4')).rejects.toBeInstanceOf(BadRequestException);
  });
});
