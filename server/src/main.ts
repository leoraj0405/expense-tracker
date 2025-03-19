import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

const PORT = 1000;
const SESSION_TIME = 1 * 60 * 1000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: SESSION_TIME,
      },
    }),
  );
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(PORT, () =>
    console.log(`Server Listening on ${PORT} port. `),
  );
}
bootstrap();
