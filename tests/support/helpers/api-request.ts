/**
 * API Request Helper - Pure Function Pattern
 * 
 * This is a pure, framework-agnostic function that accepts all dependencies explicitly.
 * It can be used in unit tests, Playwright fixtures, or any context.
 * 
 * Knowledge Base Reference: bmad/bmm/testarch/knowledge/fixture-architecture.md
 */
import { APIRequestContext } from '@playwright/test';

export type ApiRequestParams = {
  request: APIRequestContext;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
};

export async function apiRequest<T = unknown>({
  request,
  method,
  url,
  data,
  headers = {},
}: ApiRequestParams): Promise<T> {
  const response = await request.fetch(url, {
    method,
    data: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status()} ${errorText}`);
  }

  return response.json() as Promise<T>;
}


