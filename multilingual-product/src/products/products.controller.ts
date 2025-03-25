import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { ListProductDto } from './dto/list-product.dto';
import { ListResponse } from './interfaces/response';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    createProduct(@Body() createProductDTO: CreateProductDto): Promise<Product> {
        return this.productsService.createProduct(createProductDTO);
    }

    @Get()
    searchProducts(@Query() searchProductDTO: ListProductDto): Promise<ListResponse<Product[]>> {
        return this.productsService.searchProducts(searchProductDTO);
    }

    deleteTestProduct(sku: string) {
        return this.productsService.deleteProduct(sku);
    }
}
