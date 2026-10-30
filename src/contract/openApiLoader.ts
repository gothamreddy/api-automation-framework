import SwaggerParser from '@apidevtools/swagger-parser';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { OpenAPI } from 'openapi-types';
import { env } from '../config/env.js';

export type OpenAPIDocument = OpenAPI.Document;

export async function loadOpenApiSpec(specPath?: string): Promise<OpenAPIDocument> {
  const path = resolve(process.cwd(), specPath ?? env.OPENAPI_SPEC_PATH);
  if (!existsSync(path)) {
    throw new Error(`OpenAPI spec not found at ${path}. Set OPENAPI_SPEC_PATH or add the file.`);
  }
  const api = await SwaggerParser.bundle(path);
  return (await SwaggerParser.dereference(api)) as OpenAPIDocument;
}
