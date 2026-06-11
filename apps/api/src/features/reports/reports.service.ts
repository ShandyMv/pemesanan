import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { TransactionsQueryDto } from './dto/transactions-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTransactions(query: TransactionsQueryDto) {
    const orders = await this.prisma.order.findMany({
      where: {
        orderedAt: {
          ...(query.startDate ? { gte: new Date(`${query.startDate}T00:00:00`) } : {}),
          ...(query.endDate ? { lte: new Date(`${query.endDate}T23:59:59`) } : {}),
        },
      },
      include: {
        table: true,
        items: { include: { menu: true } },
        payment: true,
      },
      orderBy: { orderedAt: 'desc' },
    });

    const paidOrders = orders.filter((order) => order.status === OrderStatus.PAID);
    const paidRevenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    return {
      summary: {
        totalTransactions: orders.length,
        paidTransactions: paidOrders.length,
        paidRevenue,
      },
      data: orders,
    };
  }
}
