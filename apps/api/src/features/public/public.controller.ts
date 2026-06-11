import { Controller, Get, Param } from '@nestjs/common';
import { MenusService } from '../menus/menus.service';
import { TablesService } from '../tables/tables.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly menusService: MenusService,
    private readonly tablesService: TablesService,
  ) {}

  @Get('tables/:code')
  findTable(@Param('code') code: string) {
    return this.tablesService.findPublicByCode(code);
  }

  @Get('menus')
  findMenus() {
    return this.menusService.findAll(false);
  }
}
