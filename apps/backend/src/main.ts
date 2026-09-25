import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import { openApiDocument } from './modules/docs/openapi.document';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  // Dokumentasi API interaktif (Scalar, bukan Swagger): http://localhost:3101/api/docs
  app.use('/api/docs', apiReference({ content: openApiDocument }));
  app.enableCors({
    origin: process.env.WEB_URL?.split(',') ?? [
      'http://localhost:3100',
      'http://localhost:3000',
    ],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ?? 3101;
  await app.listen(port);
  console.log(`Tani IoT backend jalan di http://localhost:${port}/api`);
  console.log(`Dokumentasi API (Scalar) di http://localhost:${port}/api/docs`);
}
bootstrap();
