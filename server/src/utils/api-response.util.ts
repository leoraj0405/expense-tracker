import { Response } from 'express';

export interface ApiResponse<TItem = unknown, TListItem = TItem> {
  statusCode: number;
  items: TListItem[];
  item: TItem | null;
  errorMessage: string;
}

export interface PaginationMeta {
  limit: number;
  page: number;
  total: number;
}

export function buildSuccess<TItem = unknown, TListItem = TItem>(options: {
  item?: TItem | null;
  items?: TListItem[];
  statusCode?: number;
}): ApiResponse<TItem, TListItem> {
  return {
    statusCode: options.statusCode ?? 200,
    items: options.items ?? [],
    item: options.item !== undefined ? options.item : null,
    errorMessage: '',
  };
}

export function buildError(
  errorMessage: string,
  statusCode: number,
): ApiResponse<null> {
  return {
    statusCode,
    items: [],
    item: null,
    errorMessage,
  };
}

export function sendSuccess<TItem = unknown, TListItem = TItem>(
  reply: Response,
  options: {
    item?: TItem | null;
    items?: TListItem[];
    statusCode?: number;
  },
): void {
  const statusCode = options.statusCode ?? 200;
  reply.status(statusCode).send(buildSuccess({ ...options, statusCode }));
}

export function sendPaginated<T>(
  reply: Response,
  items: T[],
  meta: PaginationMeta,
  statusCode = 200,
): void {
  reply.status(statusCode).send(
    buildSuccess({
      statusCode,
      items,
      item: meta,
    }),
  );
}

export function sendError(
  reply: Response,
  errorMessage: string,
  statusCode: number,
): void {
  reply.status(statusCode).send(buildError(errorMessage, statusCode));
}
