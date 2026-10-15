import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.enableCors({
    origin: 'http://localhost:3000',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
//   console.log(
//   'JWT_SECRET loaded:',
//   Boolean(process.env.JWT_SECRET),
// );
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();