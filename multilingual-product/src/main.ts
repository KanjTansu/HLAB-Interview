import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationError, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger();
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            forbidUnknownValues: false,
            exceptionFactory: (validationErrors: ValidationError[] = []) => new BadRequestException(validationErrors),
        }),
    );

    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
    logger.log(`Application listening on port ${await app.getUrl()}`);
}
bootstrap();
