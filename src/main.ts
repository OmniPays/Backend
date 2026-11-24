import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configLoader } from './config/config-loader';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 4000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const app = await NestFactory.create(AppModule);
  const configuredOrigins = configLoader().corsOrigins;
  const corsOrigins = configuredOrigins
    ? configuredOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Soroswap Backend')
    .setDescription('The Soroswap Backend API')
    .setVersion('1.0')
    .addTag('soroswap-backend')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}
bootstrap();
