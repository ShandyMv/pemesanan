import { MenusService } from './menus.service';

describe('MenusService', () => {
  const prisma: any = {
    menu: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new MenusService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('finds all menus for admin', async () => {
    await service.findAll();
    expect(prisma.menu.findMany).toHaveBeenCalledWith({
      where: undefined,
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  });

  it('finds only available menus for public order', async () => {
    await service.findAll(false);
    expect(prisma.menu.findMany).toHaveBeenCalledWith({
      where: { isAvailable: true, category: { isActive: true } },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  });

  it('creates menu with default availability', async () => {
    const dto = {
      categoryId: 1,
      name: 'Espresso',
      description: 'Kopi',
      price: 15000,
      imageUrl: 'https://example.com/espresso.jpg',
    };
    await service.create(dto);
    expect(prisma.menu.create).toHaveBeenCalledWith({
      data: { ...dto, isAvailable: true },
    });
  });

  it('creates menu with provided availability', async () => {
    const dto = {
      categoryId: 1,
      name: 'Espresso',
      description: 'Kopi',
      price: 15000,
      imageUrl: 'https://example.com/espresso.jpg',
      isAvailable: false,
    };
    await service.create(dto);
    expect(prisma.menu.create).toHaveBeenCalledWith({
      data: dto,
    });
  });

  it('updates menu', async () => {
    await service.update(1, { price: 17000 });
    expect(prisma.menu.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { price: 17000 },
    });
  });

  it('soft removes menu', async () => {
    await service.remove(1);
    expect(prisma.menu.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isAvailable: false },
    });
  });
});
