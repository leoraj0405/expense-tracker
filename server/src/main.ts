import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // mongoose.set('debug', true); // Enable Mongoose debug mode

  app.use(cookieParser());
  const configService = app.get(ConfigService);

  app.set('trust proxy', 1);

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const port = configService.get<string>('PORT') || 1000;
  await app.listen(port, () => {
    console.log(`Server Listening on port ${port}`);
  });
}
bootstrap();
