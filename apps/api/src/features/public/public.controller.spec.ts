import { MenusService } from '../menus/menus.service';
import { TablesService } from '../tables/tables.service';
import { PublicController } from './public.controller';

describe('PublicController', () => {
  const menusService = { findAll: jest.fn() } as unknown as MenusService;
  const tablesService = { findPublicByCode: jest.fn() } as unknown as TablesService;
  const controller = new PublicController(menusService, tablesService);

  beforeEach(() => jest.clearAllMocks());

  it('delegates public table lookup', () => {
    controller.findTable('QR-M-01');
    expect(tablesService.findPublicByCode).toHaveBeenCalledWith('QR-M-01');
  });

  it('delegates public menu list', () => {
    controller.findMenus();
    expect(menusService.findAll).toHaveBeenCalledWith(false);
  });
});
