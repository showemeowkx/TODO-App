import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') ?? config.get('BACKEND_PORT') ?? 3000);
  const isProd = config.get('NODE_ENV') === 'production';
  const frontendUrl = config.get<string>('FRONTEND_URL');

  app.enableCors({
    origin:
      isProd && frontendUrl
        ? frontendUrl.split(',').map((o) => o.trim())
        : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port, '0.0.0.0');
}
bootstrap();
