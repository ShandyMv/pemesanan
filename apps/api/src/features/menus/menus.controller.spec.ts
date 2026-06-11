import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

describe('MenusController', () => {
  const service = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as MenusService;
  const controller = new MenusController(service);

  beforeEach(() => jest.clearAllMocks());

  it('delegates findAll with default query value', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalledWith(true);
  });

  it('delegates findAll with explicit query value', () => {
    controller.findAll(false);
    expect(service.findAll).toHaveBeenCalledWith(false);
  });

  it('delegates create', () => {
    const dto = {
      categoryId: 1,
      name: 'Espresso',
      description: 'Kopi',
      price: 15000,
      imageUrl: 'https://example.com/espresso.jpg',
    };
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update', () => {
    controller.update(1, { price: 16000 });
    expect(service.update).toHaveBeenCalledWith(1, { price: 16000 });
  });

  it('delegates remove', () => {
    controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
