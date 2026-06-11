import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  const prisma: any = {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new CategoriesService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('finds categories ordered by name', async () => {
    await service.findAll();
    expect(prisma.category.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
  });

  it('creates category with defaults', async () => {
    await service.create({ name: 'Kopi' });
    expect(prisma.category.create).toHaveBeenCalledWith({
      data: { name: 'Kopi', description: '', isActive: true },
    });
  });

  it('creates category with provided optional fields', async () => {
    await service.create({ name: 'Snack', description: 'Makanan ringan', isActive: false });
    expect(prisma.category.create).toHaveBeenCalledWith({
      data: { name: 'Snack', description: 'Makanan ringan', isActive: false },
    });
  });

  it('updates category', async () => {
    await service.update(1, { name: 'Non Kopi' });
    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'Non Kopi' },
    });
  });

  it('soft removes category', async () => {
    await service.remove(1);
    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isActive: false },
    });
  });
});
