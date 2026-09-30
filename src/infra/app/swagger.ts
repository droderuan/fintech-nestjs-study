import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppService } from './app.service';

export const SWAGGER_PATH = 'docs';

// DTO schemas are generated at build time by the @nestjs/swagger CLI plugin
// (nest-cli.json), which reads property types and JSDoc comments.
export function buildSwaggerDocument(app: INestApplication): OpenAPIObject {
  const { name, version } = app.get(AppService).getVersion();
  const config = new DocumentBuilder()
    .setTitle(name)
    .setDescription('Accounts and transactions API. Amounts are integer cents.')
    .setVersion(version)
    .build();

  return SwaggerModule.createDocument(app, config);
}

export function setupSwagger(app: INestApplication): void {
  SwaggerModule.setup(SWAGGER_PATH, app, () => buildSwaggerDocument(app));
}
