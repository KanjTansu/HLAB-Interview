import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import TestAgent from 'supertest/lib/agent';
import { AppModule } from '../src/app.module';
import { LanguageCode } from '../src/products/enums/language.enum';

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
