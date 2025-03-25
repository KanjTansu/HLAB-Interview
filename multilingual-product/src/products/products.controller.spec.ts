import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { LanguageCode } from './enums/language.enum';
import { Product } from './entities/product.entity';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

describe('ProductsController', () => {
    let controller: ProductsController;

    const mockProductsService = {
        searchProducts: jest.fn(),
        createProduct: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductsController],
            providers: [{ provide: ProductsService, useValue: mockProductsService }],
        }).compile();

        controller = module.get<ProductsController>(ProductsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createProduct', () => {
        it('create => should create a new product by a given data', async () => {
            // arrange
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

            const mockCreatedProduct = { id: uuidv4(), ...productDto, createdAt: new Date() } as Product;
            jest.spyOn(mockProductsService, 'createProduct').mockReturnValue(mockCreatedProduct);

            // act
            const result = await controller.createProduct(productDto);

            // assert
            expect(mockProductsService.createProduct).toHaveBeenCalled();
            expect(mockProductsService.createProduct).toHaveBeenCalledWith(productDto);

            expect(result).toEqual(mockCreatedProduct);
        });

        it('Create product with unaccepted language code', async () => {
            const productDto = {
                sku: 'SKU-999',
                translations: [
                    {
                        languageCode: 'JP',
                        name: 'Test Product',
                        description: 'Just a test',
                    },
                ],
            };

            const productDtoInstance = plainToInstance(CreateProductDto, productDto);
            expect(async () => await controller.createProduct(productDtoInstance)).toThrow(BadRequestException);
        });
    });
});
