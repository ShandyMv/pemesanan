import { Module } from '@nestjs/common';
import { MenusModule } from '../menus/menus.module';
import { TablesModule } from '../tables/tables.module';
import { PublicController } from './public.controller';

@Module({
  imports: [MenusModule, TablesModule],
  controllers: [PublicController],
})
export class PublicModule {}
