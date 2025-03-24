import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { LanguageCode } from './enums/language.enum';
import { v4 as uuidv4 } from 'uuid';

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
        const mockCreatedProduct = { id: uuidv4(), ...productDto } as Product;
        jest.spyOn(repository, 'save').mockResolvedValue(mockCreatedProduct);

        const result = await service.createProduct(productDto);
        expect(result).toEqual(mockCreatedProduct);
        expect(repository.save).toHaveBeenCalledWith({ ...productDto });
    });
});
