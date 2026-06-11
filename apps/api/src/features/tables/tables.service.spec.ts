import { NotFoundException } from '@nestjs/common';
import { TablesService } from './tables.service';

describe('TablesService', () => {
  const prisma: any = {
    cafeTable: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new TablesService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('finds all tables ordered by table number', async () => {
    await service.findAll();
    expect(prisma.cafeTable.findMany).toHaveBeenCalledWith({ orderBy: { tableNumber: 'asc' } });
  });

  it('finds active public table by code', async () => {
    const table = { id: 1, tableNumber: 'M-01' };
    prisma.cafeTable.findFirst.mockResolvedValue(table);

    await expect(service.findPublicByCode(' qr-m-01 ')).resolves.toBe(table);
    expect(prisma.cafeTable.findFirst).toHaveBeenCalledWith({
      where: {
        isActive: true,
        OR: [{ tableNumber: 'QR-M-01' }, { qrCode: 'QR-M-01' }],
      },
    });
  });

  it('throws when public table is not found', async () => {
    prisma.cafeTable.findFirst.mockResolvedValue(null);

    await expect(service.findPublicByCode('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates table with generated qr data', async () => {
    await service.create({ tableNumber: ' m-01 ' });
    expect(prisma.cafeTable.create).toHaveBeenCalledWith({
      data: {
        tableNumber: 'M-01',
        qrCode: 'QR-M-01',
        qrUrl: '/t/M-01',
        isActive: true,
      },
    });
  });

  it('creates table with provided qr code and active status', async () => {
    await service.create({ tableNumber: 'M-02', qrCode: ' custom-qr ', isActive: false });
    expect(prisma.cafeTable.create).toHaveBeenCalledWith({
      data: {
        tableNumber: 'M-02',
        qrCode: 'CUSTOM-QR',
        qrUrl: '/t/M-02',
        isActive: false,
      },
    });
  });

  it('updates table with new table number', async () => {
    await service.update(1, { tableNumber: 'm-03' });
    expect(prisma.cafeTable.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        tableNumber: 'M-03',
        qrCode: 'QR-M-03',
        qrUrl: '/t/M-03',
        isActive: undefined,
      },
    });
  });

  it('updates table without table number', async () => {
    await service.update(1, { qrCode: 'qr-custom', isActive: true });
    expect(prisma.cafeTable.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        tableNumber: undefined,
        qrCode: 'QR-CUSTOM',
        qrUrl: undefined,
        isActive: true,
      },
    });
  });

  it('returns qr payload for table', async () => {
    const table = { id: 1, qrUrl: '/t/M-01' };
    prisma.cafeTable.findUnique.mockResolvedValue(table);

    await expect(service.getQrPayload(1)).resolves.toEqual({ table, qrPayload: '/t/M-01' });
  });

  it('throws when qr table is not found', async () => {
    prisma.cafeTable.findUnique.mockResolvedValue(null);

    await expect(service.getQrPayload(1)).rejects.toBeInstanceOf(NotFoundException);
  });
});
