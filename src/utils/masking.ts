const SENSITIVE_KEYS = new Set([
  'authorization',
  'password',
  'client_secret',
  'refresh_token',
  'access_token',
  'secret',
  'token',
]);

const REDACTED = '***REDACTED***';

export function maskString(value: string, keyHint?: string): string {
  const hint = keyHint?.toLowerCase() ?? '';
  if (hint.includes('authorization') || hint.includes('bearer')) {
    return 'Bearer ***REDACTED***';
  }
  if (SENSITIVE_KEYS.has(hint)) {
    return REDACTED;
  }
  return value;
}

export function maskValue(value: unknown, keyHint?: string): unknown {
  if (typeof value === 'string') {
    return maskString(value, keyHint);
  }
  if (Array.isArray(value)) {
    return value.map((item) => maskValue(item));
  }
  if (value !== null && typeof value === 'object') {
    return maskObject(value as Record<string, unknown>);
  }
  return value;
}

export function maskObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      out[key] = REDACTED;
    } else if (typeof val === 'object' && val !== null) {
      out[key] = maskValue(val, key);
    } else if (typeof val === 'string') {
      out[key] = maskString(val, key);
    } else {
      out[key] = val;
    }
  }
  return out;
}

export function maskHeaders(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(headers)) {
    out[key] = maskString(val, key) as string;
  }
  return out;
}

export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(maskValue(value), null, 2);
}
