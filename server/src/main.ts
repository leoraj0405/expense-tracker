import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const PORT = 1000 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT, () => console.log(`Server Listening on ${PORT} port. `));
}
bootstrap();
