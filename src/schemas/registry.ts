import type { ZodTypeAny } from 'zod';

const registry: Record<string, ZodTypeAny> = {};

export function registerSchema(name: string, schema: ZodTypeAny): void {
  registry[name] = schema;
}

export function registerSchemas(schemas: Record<string, ZodTypeAny>): void {
  for (const [name, schema] of Object.entries(schemas)) {
    registerSchema(name, schema);
  }
}

export function getSchemaByName(name: string): ZodTypeAny {
  const schema = registry[name];
  if (!schema) {
    throw new Error(
      `Unknown schema "${name}". Registered: ${Object.keys(registry).join(', ') || '(none)'}. Register in src/schemas/index.ts.`,
    );
  }
  return schema;
}

export function listSchemaNames(): string[] {
  return Object.keys(registry);
}
