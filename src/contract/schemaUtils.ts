import type { JSONSchemaType } from 'ajv/dist/types/json-schema.js';

export function applyStrictMode(schema: unknown, strict: boolean): unknown {
  if (!strict || !schema || typeof schema !== 'object') {
    return schema;
  }
  return deepStrictClone(schema as Record<string, unknown>);
}

function deepStrictClone(schema: Record<string, unknown>): Record<string, unknown> {
  const clone: Record<string, unknown> = { ...schema };

  if (clone.type === 'object' && clone.properties && typeof clone.properties === 'object') {
    clone.additionalProperties = false;
    const props: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(clone.properties as Record<string, unknown>)) {
      props[key] =
        val && typeof val === 'object' ? deepStrictClone(val as Record<string, unknown>) : val;
    }
    clone.properties = props;
  }

  if (clone.items && typeof clone.items === 'object') {
    clone.items = deepStrictClone(clone.items as Record<string, unknown>);
  }

  if (Array.isArray(clone.allOf)) {
    clone.allOf = clone.allOf.map((s) =>
      s && typeof s === 'object' ? deepStrictClone(s as Record<string, unknown>) : s,
    );
  }

  return clone;
}

export function formatAjvErrors(errors: { instancePath: string; message?: string; params?: unknown }[]): string {
  return errors
    .map((e) => {
      const path = e.instancePath || '/';
      const msg = e.message ?? 'validation failed';
      const params = e.params ? ` (${JSON.stringify(e.params)})` : '';
      return `- ${path}: ${msg}${params}`;
    })
    .join('\n');
}

export type JsonSchema = JSONSchemaType<unknown>;
