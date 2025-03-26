# HLAB-Interview

Use for HLAB Pre-Assessment only

# Back-end Questions

## 1. Design new API for feature that require data from 3 microservices:

### Answer

- Use Asynchronous Event-Driven Aggregation by using microservices transport such as Redis Pub/Sub

## 2. How would you recommend you for a performance test strategy plan proceeding to the project manager?

### Answer

1. Define Performance Testing Goals

   - Ensure the NestJS backend can handle expected concurrent users.
   - Measure API response times under different loads.
   - Evaluate the impact of authentication and authorization processes.

2. Identify Key Performance Metrics
   - Response Time: API should respond within X ms under normal and peak loads.
   - Throughput: Number of requests the system can handle per second.
   - Error Rate: Percentage of failed requests under load.
3. Define Performance Test Types
   - Load Testing: Simulate normal and peak traffic to measure response times and system stability.
   - Page Load Time: Optimize initial render speed using Lighthouse/WebPageTest.
   - Rendering Performance: Use React DevTools to measure component rendering time.
   - Network Performance: Analyze API call efficiency and minimize redundant requests.
4. Define Testing Tools
   - Backend (NestJS)
     - Postman – API response time and functional performance testing.
   - Frontend (React)
     - Chrome DevTools – Analyzing network requests and rendering performance.
5. Define Testing Environment
   - Use a staging environment that mirrors production.

## 3. Design and develop two APIs using NestJS and Postgres:

### Answer

Step 1 : Design data schema of product with this schema. From this schema will can be search in multilingual both name and description by direct query to column using 'ilike' method or can be use vector search in future.

```js
class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    sku: string;

    @OneToMany(() => ProductTranslation, (translation) => translation.product, { cascade: true })
    translations: ProductTranslation[];

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    readonly createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    readonly updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
    deletedAt: Date;
}

class ProductTranslation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'language_code', type: 'varchar', length: 5 })
    languageCode: string;

    @Column({ name: 'name', type: 'varchar', length: 255 })
    name: string;

    @Column({ name: 'description', nullable: true, type: 'text' })
    description: string;

    @ManyToOne(() => Product, (product) => product.translations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Product;
}

```

Step 2 : Design API by using

- POST Method to Create Product
- Using CreateProductDto to validate data input from body in request
- CreateProductDTO will validate data by below condition
  - 1 product should have at least 1 translation to provide simple data to user
  - translation will validate language code that we support by using enums to check language code.

```js
@Post()
createProduct(@Body() createProductDTO: CreateProductDto): Promise<Product> {
    return this.productsService.createProduct(createProductDTO);
}

class CreateProductDto {
    @IsString()
    sku: string;

    @ValidateNested({ each: true })
    @Type(() => CreateProductTranslationDto)
    @ArrayMinSize(1)
    translations: CreateProductTranslationDto[];
}

class CreateProductTranslationDto {
    @IsEnum(LanguageCode)
    languageCode: LanguageCode;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}

```

- GET Method to List Product by using pagination
- Using ListProductDto to validate data input from query string in request
- ListProductDto will validate data by below condition
  - search,page,limit can be optional to provide

```js
@Get()
searchProducts(@Query() searchProductDTO: ListProductDto): Promise<ListResponse<Product[]>> {
  return this.productsService.searchProducts(searchProductDTO);
}

class ListProductDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}

```

Step 3 : Create service.spec.ts to do an Unit test and Create controller.spec.ts to do an integration testing and Crate app.e2e-spec.ts to do an E2E testing.

#### products.service.spec.ts

```js
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
```

#### products.controller.spec.ts

```js
describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'postgres',
            ...getDBConfig(config),
          }),
        }),
        ProductsModule,
      ],
    }).compile();

    controller = module.get < ProductsController > ProductsController;
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

      const productSearched = await controller.searchProducts({
        search: 'test',
        page: 1,
        limit: 1,
      });
      expect(
        productSearched.totalData.find((product) => product.sku === 'SKU-999')
      ).toBeTruthy();
      await controller.deleteTestProduct(productDto.sku);
    });
  });
});
```

#### app.e2e-spec.ts

```js
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let testAgent: TestAgent;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    if (app) testAgent = request(app.getHttpServer());
  });

  describe('/products', () => {
    it('/products (POST)', () => {
      return testAgent
        .post('/products')
        .send({
          sku: 'SKU-99999',
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
        })
        .expect(201);
    });

    it('/products (GET)', () => {
      return testAgent.get('/products?limit=20&page=1').expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

# React Questions

## 1. UseCallback ใช้ทำอะไร

### Answer

- ใช้สำหรับ stored function
- ถูกเรียกอีกครั้งเมื่อสั่ง Call ฟังก์ชันและค่าใน deps มีการเปลี่ยนแปลง

## 2. Write a unit test for the UserProfile React component

### Answer

```jsx
describe('UserProfile Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('displays user data after successful fetch', async () => {
    const mockUser = { name: 'John Doe', email: 'john@example.com' };
    fetchMock.mockResponseOnce(JSON.stringify(mockUser));

    render(<UserProfile userId={1} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
    );
    expect(screen.getByText(`Email: ${mockUser.email}`)).toBeInTheDocument();
  });

  it('displays an error message if fetch fails', async () => {
    fetchMock.mockReject(new Error('Failed to fetch user data'));

    render(<UserProfile userId={1} />);

    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
    expect(screen.getByText(/Failed to fetch user data/i)).toBeInTheDocument();
  });
});
```
