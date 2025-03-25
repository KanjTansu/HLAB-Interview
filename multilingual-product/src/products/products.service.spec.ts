import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { LanguageCode } from './enums/language.enum';
import { v4 as uuidv4 } from 'uuid';
import { ListProductDto } from './dto/list-product.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('ProductsService', () => {
    let service: ProductsService;
    let repository: Repository<Product>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: getRepositoryToken(Product),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        repository = module.get<Repository<Product>>(getRepositoryToken(Product));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Create product', () => {
        it('Create product', async () => {
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
            jest.spyOn(repository, 'save').mockResolvedValue(mockCreatedProduct);

            const result = await service.createProduct(productDto);
            expect(result).toEqual(mockCreatedProduct);
            expect(repository.save).toHaveBeenCalledWith({ ...productDto });
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
            const errors = await validate(productDtoInstance);
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    describe('Search products', () => {
        it('should return paginated product search results', async () => {
            const searchParams: ListProductDto = {
                search: 'laptop',
                page: 1,
                limit: 10,
            };

            const thTranslation = {
                id: uuidv4(),
                languageCode: LanguageCode.TH,
                name: 'สินค้าเทสต์',
                description: 'รายละเอียด',
            };
            const mockSearchedProducts = {
                id: uuidv4(),
                sku: 'SKU-999',
                createdAt: new Date(),
                translations: [
                    {
                        id: uuidv4(),
                        languageCode: LanguageCode.EN,
                        name: 'Laptop',
                        description: 'A good laptop',
                    },
                ],
            };
            const mockProducts: Product[] = [mockSearchedProducts];
            jest.spyOn(repository, 'findAndCount').mockResolvedValue([mockProducts, 1]);
            jest.spyOn(repository, 'find').mockResolvedValue([
                { ...mockSearchedProducts, translations: [...mockSearchedProducts.translations, thTranslation] },
            ]);

            const result = await service.searchProducts(searchParams);

            expect(result).toEqual({
                totalData: [{ ...mockSearchedProducts, translations: [...mockSearchedProducts.translations, thTranslation] }],
                totalCount: 1,
            });
        });

        it('should return empty results when no products are found', async () => {
            jest.spyOn(repository, 'findAndCount').mockResolvedValue([[], 0]);
            const result = await service.searchProducts({ search: 'xyz', page: 1, limit: 10 });

            expect(result).toEqual({ totalData: [], totalCount: 0 });
        });
    });
});
