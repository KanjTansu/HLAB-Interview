import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductTranslation } from './entities/product-translations.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Product, ProductTranslation])],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule {}
