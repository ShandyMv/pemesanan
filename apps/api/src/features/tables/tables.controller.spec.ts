import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

describe('TablesController', () => {
  const service = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    getQrPayload: jest.fn(),
  } as unknown as TablesService;
  const controller = new TablesController(service);

  beforeEach(() => jest.clearAllMocks());

  it('delegates findAll', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalledWith();
  });

  it('delegates create', () => {
    const dto = { tableNumber: 'm-01' };
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update', () => {
    controller.update(1, { tableNumber: 'M-02' });
    expect(service.update).toHaveBeenCalledWith(1, { tableNumber: 'M-02' });
  });

  it('delegates qr payload', () => {
    controller.getQrCode(1);
    expect(service.getQrPayload).toHaveBeenCalledWith(1);
  });
});
