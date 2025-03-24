import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env'],
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                ...(configService.get('POSTGRES_SCHEMA') && { schema: configService.get('POSTGRES_SCHEMA') }),
                host: configService.get('POSTGRES_HOST'),
                port: +configService.get('POSTGRES_PORT'),
                database: configService.get('POSTGRES_DB'),
                username: configService.get('POSTGRES_USER'),
                password: configService.get('POSTGRES_PASSWORD'),
                synchronize: false,
                autoLoadEntities: true,
                entities: ['dist/**/*.entity{.ts,.js}'],
                logging: configService.get('DB_DEBUG') || false,
                ssl: configService.get('POSTGRES_SSL') === 'true' ? { rejectUnauthorized: false } : false,
            }),
        }),
        ProductsModule,
    ],
})
export class AppModule {}
