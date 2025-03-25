import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
config();

const configService = new ConfigService();

export const getDBConfig = (configService: ConfigService) => ({
    ...(configService.get('POSTGRES_SCHEMA') && { schema: configService.get('POSTGRES_SCHEMA') }),
    host: configService.get('POSTGRES_HOST'),
    port: +configService.get('POSTGRES_PORT'),
    database: configService.get('POSTGRES_DB'),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    synchronize: configService.get('NODE_ENV') === 'development',
    entities: ['**/*.entity.ts'],
    logging: configService.get('DB_DEBUG') || false,
    ssl: configService.get('POSTGRES_SSL') === 'true' ? { rejectUnauthorized: false } : false,
    migrations: ['src/migrations/*-migration.ts'],
    migrationsRun: false,
});

const AppDataSource = new DataSource({ type: 'postgres', ...getDBConfig(configService) });

export default AppDataSource;
