import './env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './infra/app/app.module';
import { setupSwagger } from './infra/app/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
