import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { RejectOrderDto } from './dto/reject-order.dto';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get('orders/:orderCode')
  findByCode(@Param('orderCode') orderCode: string) {
    return this.ordersService.findByCode(orderCode);
  }

  // Endpoint publik untuk HP customer (tanpa login) memantau status pesanan.
  @Get('public/orders/:publicToken')
  findByPublicToken(@Param('publicToken') publicToken: string) {
    return this.ordersService.findByPublicToken(publicToken);
  }

  // Pembayaran cashless mandiri di meja (tanpa login, diamankan publicToken).
  @Post('public/orders/:publicToken/pay')
  payAtTable(@Param('publicToken') publicToken: string) {
    return this.ordersService.payAtTable(publicToken);
  }

  @Get('cashier/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CASHIER)
  findCashierOrders() {
    return this.ordersService.findCashierOrders();
  }

  @Patch('cashier/orders/:id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CASHIER, UserRole.ADMIN)
  acceptOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.acceptOrder(id);
  }

  @Patch('cashier/orders/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CASHIER, UserRole.ADMIN)
  rejectOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: RejectOrderDto) {
    return this.ordersService.rejectOrder(id, dto);
  }

  @Patch('cashier/orders/:id/pay')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CASHIER)
  confirmPayment(@Param('id', ParseIntPipe) id: number, @Body() dto: ConfirmPaymentDto, @Req() request: AuthenticatedRequest) {
    const cashierId = request.user?.sub;
    if (!cashierId) {
      throw new UnauthorizedException('Token kasir tidak valid.');
    }

    return this.ordersService.confirmPayment(id, dto, cashierId);
  }
}
