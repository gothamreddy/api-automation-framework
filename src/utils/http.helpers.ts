export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function parseHttpMethod(method: string): HttpMethod {
  const upper = method.toUpperCase();
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(upper)) {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }
  return upper as HttpMethod;
}

export function parseJsonDocString(docString: string): unknown {
  const trimmed = docString.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

export function dataTableToQuery(rows: string[][]): Record<string, string> {
  const query: Record<string, string> = {};
  for (const row of rows) {
    query[row[0]] = row[1];
  }
  return query;
}
