import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  const service = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as CategoriesService;
  const controller = new CategoriesController(service);

  beforeEach(() => jest.clearAllMocks());

  it('delegates findAll', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalledWith();
  });

  it('delegates create', () => {
    const dto = { name: 'Kopi' };
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update', () => {
    const dto = { name: 'Coffee' };
    controller.update(1, dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('delegates remove', () => {
    controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
