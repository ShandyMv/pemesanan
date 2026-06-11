import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

function normalizeTableNumber(tableNumber: string) {
  return tableNumber.trim().toUpperCase();
}

function makeTableQr(tableNumber: string) {
  return {
    qrCode: `QR-${tableNumber}`,
    qrUrl: `/t/${tableNumber}`,
  };
}

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cafeTable.findMany({
      orderBy: { tableNumber: 'asc' },
    });
  }

  async findPublicByCode(code: string) {
    const table = await this.prisma.cafeTable.findFirst({
      where: {
        isActive: true,
        OR: [
          { tableNumber: normalizeTableNumber(code) },
          { qrCode: code.trim().toUpperCase() },
        ],
      },
    });

    if (!table) {
      throw new NotFoundException('Meja tidak ditemukan atau tidak aktif.');
    }

    return table;
  }

  create(dto: CreateTableDto) {
    const tableNumber = normalizeTableNumber(dto.tableNumber);
    const fallbackQr = makeTableQr(tableNumber);

    return this.prisma.cafeTable.create({
      data: {
        tableNumber,
        qrCode: dto.qrCode?.trim().toUpperCase() ?? fallbackQr.qrCode,
        qrUrl: fallbackQr.qrUrl,
        isActive: dto.isActive ?? true,
      },
    });
  }

  update(id: number, dto: UpdateTableDto) {
    const tableNumber = dto.tableNumber ? normalizeTableNumber(dto.tableNumber) : undefined;
    const fallbackQr = tableNumber ? makeTableQr(tableNumber) : undefined;

    return this.prisma.cafeTable.update({
      where: { id },
      data: {
        tableNumber,
        qrCode: dto.qrCode?.trim().toUpperCase() ?? fallbackQr?.qrCode,
        qrUrl: fallbackQr?.qrUrl,
        isActive: dto.isActive,
      },
    });
  }

  async getQrPayload(id: number) {
    const table = await this.prisma.cafeTable.findUnique({ where: { id } });
    if (!table) {
      throw new NotFoundException('Meja tidak ditemukan.');
    }

    return {
      table,
      qrPayload: table.qrUrl,
    };
  }
}
