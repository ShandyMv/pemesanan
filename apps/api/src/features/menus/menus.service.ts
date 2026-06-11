import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeUnavailable = true) {
    return this.prisma.menu.findMany({
      where: includeUnavailable ? undefined : { isAvailable: true, category: { isActive: true } },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  create(dto: CreateMenuDto) {
    return this.prisma.menu.create({
      data: {
        ...dto,
        isAvailable: dto.isAvailable ?? true,
      },
    });
  }

  update(id: number, dto: UpdateMenuDto) {
    return this.prisma.menu.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.menu.update({
      where: { id },
      data: { isAvailable: false },
    });
  }
}
