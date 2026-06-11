import { OrderStatus } from '@prisma/client';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  const prisma: any = {
    order: {
      findMany: jest.fn(),
    },
  };
  const service = new ReportsService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('returns report with date filters and paid revenue', async () => {
    prisma.order.findMany.mockResolvedValue([
      { id: 1, status: OrderStatus.PAID, totalAmount: 50000 },
      { id: 2, status: OrderStatus.PENDING, totalAmount: 30000 },
    ]);

    await expect(service.getTransactions({ startDate: '2026-05-01', endDate: '2026-05-31' })).resolves.toEqual({
      summary: {
        totalTransactions: 2,
        paidTransactions: 1,
        paidRevenue: 50000,
      },
      data: [
        { id: 1, status: OrderStatus.PAID, totalAmount: 50000 },
        { id: 2, status: OrderStatus.PENDING, totalAmount: 30000 },
      ],
    });
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: {
        orderedAt: {
          gte: new Date('2026-05-01T00:00:00'),
          lte: new Date('2026-05-31T23:59:59'),
        },
      },
      include: {
        table: true,
        items: { include: { menu: true } },
        payment: true,
      },
      orderBy: { orderedAt: 'desc' },
    });
  });

  it('returns report without date filters', async () => {
    prisma.order.findMany.mockResolvedValue([]);

    await expect(service.getTransactions({})).resolves.toEqual({
      summary: {
        totalTransactions: 0,
        paidTransactions: 0,
        paidRevenue: 0,
      },
      data: [],
    });
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { orderedAt: {} },
      include: {
        table: true,
        items: { include: { menu: true } },
        payment: true,
      },
      orderBy: { orderedAt: 'desc' },
    });
  });
});
