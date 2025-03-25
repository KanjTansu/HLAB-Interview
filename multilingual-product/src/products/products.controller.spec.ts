import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';

import { CreateProductDto } from './dto/create-product.dto';
import { LanguageCode } from './enums/language.enum';

import { ProductsModule } from './products.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDBConfig } from '../config/typeorm.config';

describe('ProductsController', () => {
    let controller: ProductsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) => ({ type: 'postgres', ...getDBConfig(config) }),
                }),
                ProductsModule,
            ],
        }).compile();

        controller = module.get<ProductsController>(ProductsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createProduct', () => {
        it('create => should create a new product by a given data', async () => {
            const productDto: CreateProductDto = {
                sku: 'SKU-999',
                translations: [
                    {
                        languageCode: LanguageCode.EN,
                        name: 'Test Product',
                        description: 'Just a test',
                    },
                    {
                        languageCode: LanguageCode.TH,
                        name: 'สินค้าเทสต์',
                        description: 'รายละเอียด',
                    },
                ],
            };

            const product = await controller.createProduct(productDto);
            expect(product.id).toBeDefined();

            const productSearched = await controller.searchProducts({ search: 'test', page: 1, limit: 1 });
            expect(productSearched.totalData.find((product) => product.sku === 'SKU-999')).toBeTruthy();

            await controller.deleteTestProduct(productDto.sku);
        });
    });
});
