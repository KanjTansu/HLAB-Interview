import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { LanguageCode } from './enums/language.enum';
import { v4 as uuidv4 } from 'uuid';
import { ListProductDto } from './dto/list-product.dto';

describe('ProductsService', () => {
    let service: ProductsService;
    let repository: Repository<Product>;

    const mockRepository = {
        save: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn(),
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        repository = module.get<Repository<Product>>(getRepositoryToken(Product));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

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

    describe('Search products', () => {
        it('should return paginated product search results', async () => {
            const searchParams: ListProductDto = {
                search: 'laptop',
                page: 1,
                limit: 10,
            };

            const mockProducts = [{ id: 1, name: 'Laptop', description: 'A good laptop' }];
            mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([mockProducts, 1]);

            const result = await service.searchProducts(searchParams);

            expect(result).toEqual({ totalData: mockProducts, totalCount: 1 });
        });

        it('should return empty results when no products are found', async () => {
            mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([[], 0]);
            const result = await service.searchProducts({ search: 'xyz', page: 1, limit: 10 });

            expect(result).toEqual({ totalData: [], totalCount: 0 });
        });
    });
});
