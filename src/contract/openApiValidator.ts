import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import type { OpenAPI } from 'openapi-types';
import { env } from '../config/env.js';
import { loadOpenApiSpec } from './openApiLoader.js';
import { findMatchingPath } from './pathMatcher.js';
import { applyStrictMode, formatAjvErrors } from './schemaUtils.js';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export class OpenApiValidator {
  private readonly ajv: Ajv;

  private constructor(
    private readonly spec: OpenAPI.Document | null,
    private readonly loadError?: Error,
  ) {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
  }

  static async load(): Promise<OpenApiValidator> {
    try {
      const spec = await loadOpenApiSpec();
      return new OpenApiValidator(spec);
    } catch (err) {
      return new OpenApiValidator(null, err instanceof Error ? err : new Error(String(err)));
    }
  }

  get available(): boolean {
    return this.spec !== null;
  }

  private requireSpec(): OpenAPI.Document {
    if (!this.spec) {
      throw new Error(
        `OpenAPI validator is unavailable: ${this.loadError?.message ?? 'spec not loaded'}`,
      );
    }
    return this.spec;
  }

  validateResponse(method: string, path: string, status: number, body: unknown): void {
    const operation = this.resolveOperation(method, path);
    if (!operation) {
      throw new Error(`No OpenAPI operation found for ${method.toUpperCase()} ${path}`);
    }

    const responses = operation.responses ?? {};
    const statusKey = String(status);
    const responseSpec =
      (responses[statusKey] as OpenAPI.ResponseObject | undefined) ??
      (responses.default as OpenAPI.ResponseObject | undefined);

    if (!responseSpec) {
      throw new Error(`No response definition for status ${status} on ${method.toUpperCase()} ${path}`);
    }

    const schema = this.extractJsonSchema(responseSpec);
    if (!schema) {
      return;
    }

    this.validateData(schema, body, `response ${method.toUpperCase()} ${path} (${status})`);
  }

  validateRequestBody(method: string, pathTemplate: string, body: unknown): void {
    const operation = this.resolveOperation(method, pathTemplate);
    if (!operation) {
      throw new Error(`No OpenAPI operation found for ${method.toUpperCase()} ${pathTemplate}`);
    }

    const requestBody = operation.requestBody as OpenAPI.RequestBodyObject | undefined;
    if (!requestBody?.content?.['application/json']?.schema) {
      throw new Error(`No request body schema for ${method.toUpperCase()} ${pathTemplate}`);
    }

    const schema = requestBody.content['application/json'].schema;
    this.validateData(schema, body, `request body ${method.toUpperCase()} ${pathTemplate}`);
  }

  private resolveOperation(method: string, path: string): OpenAPI.OperationObject | undefined {
    const m = method.toLowerCase() as HttpMethod;
    const paths = this.requireSpec().paths ?? {};
    const templatePaths = Object.keys(paths);
    const matched = findMatchingPath(path, templatePaths) ?? path;
    const pathItem = paths[matched];
    if (!pathItem) return undefined;
    return pathItem[m] as OpenAPI.OperationObject | undefined;
  }

  private extractJsonSchema(responseSpec: OpenAPI.ResponseObject): unknown {
    const content = responseSpec.content?.['application/json'];
    return content?.schema;
  }

  private validateData(schema: unknown, data: unknown, context: string): void {
    const prepared = applyStrictMode(schema, env.CONTRACT_STRICT ?? false);
    const validate = this.ajv.compile(prepared as object);
    const valid = validate(data);
    if (!valid) {
      const formatted = formatAjvErrors((validate.errors ?? []) as ErrorObject[]);
      throw new Error(`OpenAPI contract validation failed for ${context}:\n${formatted}`);
    }
  }
}
