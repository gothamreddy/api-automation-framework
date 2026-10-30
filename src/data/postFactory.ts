export function buildPostPayload(overrides: Partial<{ title: string; body: string; userId: number }> = {}) {
  return {
    title: 'test title',
    body: 'test body',
    userId: 1,
    ...overrides,
  };
}
