import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductDto } from './dto/list-product.dto';
import { ListResponse } from './interfaces/response';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepo: Repository<Product>,
    ) {}

    async searchProducts({ lang, search, page, limit }: ListProductDto): Promise<ListResponse<Product[]>> {
        limit = limit == 0 ? 10 : limit;
        const skip = limit * (page - 1) < 0 ? 0 : limit * (page - 1);

        const query = this.productRepo
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.translations', 't', 't.languageCode = :lang', { lang })
            .where("to_tsvector(t.languageCode, t.name || ' ' || t.description) @@ plainto_tsquery(:lang, :search)", { lang, search })
            .skip(skip)
            .take(limit);

        const [totalData, totalCount] = await query.getManyAndCount();
        return { totalData, totalCount };
    }

    async createProduct(createProductDTO: CreateProductDto): Promise<Product> {
        return await this.productRepo.save(createProductDTO);
    }
}
