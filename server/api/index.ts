import { Handler } from 'aws-lambda';
import { createNestServer } from '../src/lambda/main';

let cachedHandler: Handler;

export async function handler(...args: Parameters<Handler>) {
  if (!cachedHandler) {
    cachedHandler = await createNestServer();
  }
  return cachedHandler(...args);
}
