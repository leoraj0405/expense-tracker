import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const PORT = 1000;
const SESSION_TIME = 30 * 60 * 1000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Expense tracker API')
    .setDescription('Expense tracker documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apidocs', app, document);

  app.use(cookieParser());

  app.use(
    session({
      secret: 'expense-tracker',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: SESSION_TIME,
        sameSite: 'lax',
        httpOnly: true,
      },
    }),
  );
  
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(PORT, () =>
    console.log(`Server Listening on ${PORT} port. `),
  );
}
bootstrap();
