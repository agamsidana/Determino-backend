import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setUpSwagger } from './config/swagger.config';
import { validationPipe } from './config/validation.config';
import { configuration } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  setUpSwagger(app);

  app.useGlobalPipes(validationPipe);

  app.enableCors();

  await app.listen(configuration().PORT?? 5000);
}
bootstrap();
