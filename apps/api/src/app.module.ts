import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './features/auth/auth.module';
import { CategoriesModule } from './features/categories/categories.module';
import { HealthModule } from './features/health/health.module';
import { MenusModule } from './features/menus/menus.module';
import { OrdersModule } from './features/orders/orders.module';
import { PublicModule } from './features/public/public.module';
import { ReportsModule } from './features/reports/reports.module';
import { TablesModule } from './features/tables/tables.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    AuthModule,
    PublicModule,
    CategoriesModule,
    MenusModule,
    TablesModule,
    OrdersModule,
    ReportsModule,
  ],
})
export class AppModule {}
