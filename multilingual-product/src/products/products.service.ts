import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ILike, In, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductDto } from './dto/list-product.dto';
import { ListResponse } from './interfaces/response';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepo: Repository<Product>,
    ) {}

    async searchProducts({ search, page, limit }: ListProductDto): Promise<ListResponse<Product[]>> {
        limit = limit == 0 ? 10 : limit;
        const skip = limit * (page - 1) < 0 ? 0 : limit * (page - 1);

        const whereCondition = search
            ? [{ translations: { name: ILike(`%${search}%`) } }, { translations: { description: ILike(`%${search}%`) } }]
            : {};
        const [allSearch, totalCount] = await this.productRepo.findAndCount({
            take: limit,
            skip,
            where: whereCondition,
            relations: { translations: true },
        });
        if (totalCount === 0) return { totalData: [], totalCount: 0 };
        const totalData = await this.productRepo.find({
            where: { id: In(allSearch.map(({ id }) => id)) },
            relations: { translations: true },
        });
        return { totalData, totalCount };
    }

    async createProduct(createProductDTO: CreateProductDto): Promise<Product> {
        return await this.productRepo.save(createProductDTO);
    }

    async deleteProduct(sku: string): Promise<void> {
        await this.productRepo.delete({ sku });
    }
}
