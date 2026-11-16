import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validate every request body against its DTO.
  // whitelist: true removes any property the DTO does not declare.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Let a browser front end on another origin call this API
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
