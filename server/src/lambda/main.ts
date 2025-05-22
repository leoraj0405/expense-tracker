// src/lambda/main.ts
// Converts NestJS app into a serverless-compatible handler
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import serverlessExpress from '@vendia/serverless-express';

let cachedServer: any;

export async function createNestServer() {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    await app.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}
