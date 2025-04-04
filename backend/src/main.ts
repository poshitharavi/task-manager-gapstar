import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = "api";

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();
  dotenv.config();

  const config = new DocumentBuilder()
    .setTitle("Task Manager API Documentation")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-documentation", app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);
  Logger.log(
    `🚀 Task Manager Backend Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}
bootstrap();
