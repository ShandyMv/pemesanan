import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentChannel, PaymentMethod, PaymentStatus } from '@prisma/client';
import { makeOrderCode, makePublicToken } from '../../common/order-code';
import { PrismaService } from '../../database/prisma.service';
import { ConfirmPaymentDto, PaymentMethodInput } from './dto/confirm-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { RejectOrderDto } from './dto/reject-order.dto';

const orderInclude = {
  table: true,
  items: { include: { menu: true } },
  payment: {
    include: {
      cashier: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const table = await this.prisma.cafeTable.findFirst({
      where: {
        isActive: true,
        OR: [
          { tableNumber: dto.tableCode.trim().toUpperCase() },
          { qrCode: dto.tableCode.trim().toUpperCase() },
        ],
      },
    });

    if (!table) {
      throw new BadRequestException('Meja tidak valid atau tidak aktif.');
    }

    const menuIds = dto.items.map((item) => item.menuId);
    const menus = await this.prisma.menu.findMany({
      where: {
        id: { in: menuIds },
        isAvailable: true,
        category: { isActive: true },
      },
      select: {
        id: true,
        price: true,
      },
    });
    const menusById = new Map(menus.map((menu) => [menu.id, menu]));

    if (menusById.size !== new Set(menuIds).size) {
      throw new BadRequestException('Terdapat menu yang tidak tersedia.');
    }

    const lineItems = dto.items.map((item) => {
      const menu = menusById.get(item.menuId)!;
      const price = Number(menu.price);

      return {
        menuId: item.menuId,
        quantity: item.quantity,
        price,
        subtotal: price * item.quantity,
        note: item.note,
      };
    });
    const totalAmount = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const now = new Date();
    const startOfDay = new Date(now);
    const endOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay.setHours(23, 59, 59, 999);
    const dailySequence = await this.prisma.order.count({
      where: {
        orderedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return this.prisma.$transaction((tx) =>
      tx.order.create({
        data: {
          tableId: table.id,
          orderCode: makeOrderCode(now, dailySequence + 1),
          publicToken: makePublicToken(),
          customerName: dto.customerName?.trim() || 'Customer',
          totalAmount,
          status: OrderStatus.PENDING,
          orderedAt: now,
          items: {
            create: lineItems,
          },
        },
        include: orderInclude,
      }),
    );
  }

  async findByCode(orderCode: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderCode: orderCode.trim().toUpperCase() },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan.');
    }

    return order;
  }

  async findByPublicToken(publicToken: string) {
    const order = await this.prisma.order.findUnique({
      where: { publicToken: publicToken.trim() },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan.');
    }

    return order;
  }

  async acceptOrder(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan.');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Hanya pesanan baru yang dapat dikonfirmasi.');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.AWAITING_PAYMENT },
      include: orderInclude,
    });
  }

  async rejectOrder(id: number, dto: RejectOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan.');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestException('Pesanan ini tidak dapat ditolak.');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.REJECTED,
        rejectedReason: dto.reason?.trim() || 'Menu tidak tersedia.',
      },
      include: orderInclude,
    });
  }

  async payAtTable(publicToken: string) {
    const order = await this.prisma.order.findUnique({
      where: { publicToken: publicToken.trim() },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan.');
    }

    if (order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestException('Pesanan belum dapat dibayar. Menunggu konfirmasi kafe.');
    }

    const totalAmount = Number(order.totalAmount);
    const paidAt = new Date();

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          orderId: order.id,
          cashierId: null,
          amountPaid: totalAmount,
          changeAmount: 0,
          paymentMethod: PaymentMethod.CASHLESS,
          paymentChannel: PaymentChannel.SELF_TABLE,
          paymentStatus: PaymentStatus.PAID,
          paidAt,
        },
      });

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          paidAt,
        },
        include: orderInclude,
      });
    });
  }

  findCashierOrders() {
    return this.prisma.order.findMany({
      include: orderInclude,
      orderBy: { orderedAt: 'desc' },
    });
  }

  async confirmPayment(id: number, dto: ConfirmPaymentDto, cashierId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan.');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestException('Order sudah tidak dapat dibayar.');
    }

    const totalAmount = Number(order.totalAmount);
    if (dto.amountPaid < totalAmount) {
      throw new BadRequestException('Nominal pembayaran kurang dari total tagihan.');
    }

    if (dto.paymentMethod === PaymentMethodInput.CASHLESS && dto.amountPaid !== totalAmount) {
      throw new BadRequestException('Nominal non tunai harus sama dengan total tagihan.');
    }

    const paidAt = new Date();
    const paymentMethod = dto.paymentMethod === PaymentMethodInput.CASH ? PaymentMethod.CASH : PaymentMethod.CASHLESS;
    const changeAmount = dto.paymentMethod === PaymentMethodInput.CASH ? Math.max(dto.amountPaid - totalAmount, 0) : 0;

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          orderId: order.id,
          cashierId,
          amountPaid: dto.amountPaid,
          changeAmount,
          paymentMethod,
          paymentChannel: PaymentChannel.CASHIER,
          paymentStatus: PaymentStatus.PAID,
          paidAt,
        },
      });

      return tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.PAID,
          paidAt,
        },
        include: orderInclude,
      });
    });
  }
}
