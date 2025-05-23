import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as FileStore from 'session-file-store';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

const SESSION_TIME = 30 * 60 * 1000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // mongoose.set('debug', true); // Enable Mongoose debug mode

  const FileStoreSession = FileStore(session);

  const config = new DocumentBuilder()
    .setTitle('Expense tracker API')
    .setDescription('Expense tracker documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apidocs', app, document);

  app.use(cookieParser());
  const configService = app.get(ConfigService);

  app.use(
    session({
      store: new FileStoreSession({
        path: './sessions',
        retries: 1,
      }),
      secret: 'expense-tracker',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: SESSION_TIME,
        sameSite: 'none',
        httpOnly: true,
        secure: true
      },
    }),
  );

  app.enableCors({
    origin: 'https://expense-tracker-client-woad.vercel.app',
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const port = configService.get<string>('PORT') || 1000
  await app.listen(port, '0.0.0.0', () => {
    console.log(`Server Listening on port ${port}`);
  });
}
bootstrap();
