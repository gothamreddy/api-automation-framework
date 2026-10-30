import jwt from 'jsonwebtoken';

export interface CachedToken {
  token: string;
  expiresAt: number;
}

const REFRESH_BUFFER_MS = 30_000;

export class TokenCache {
  private readonly cache = new Map<string, CachedToken>();

  get(role: string): CachedToken | undefined {
    const entry = this.cache.get(role);
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt - REFRESH_BUFFER_MS) {
      this.cache.delete(role);
      return undefined;
    }
    return entry;
  }

  set(role: string, token: string, expiresInSeconds?: number): void {
    const expiresAt = resolveExpiry(token, expiresInSeconds);
    this.cache.set(role, { token, expiresAt });
  }

  invalidate(role?: string): void {
    if (role) {
      this.cache.delete(role);
    } else {
      this.cache.clear();
    }
  }

  getToken(role: string): string | undefined {
    return this.get(role)?.token;
  }
}

function resolveExpiry(token: string, expiresInSeconds?: number): number {
  if (expiresInSeconds !== undefined) {
    return Date.now() + expiresInSeconds * 1000;
  }
  const decoded = jwt.decode(token);
  if (decoded && typeof decoded === 'object' && 'exp' in decoded && typeof decoded.exp === 'number') {
    return decoded.exp * 1000;
  }
  return Date.now() + 3600 * 1000;
}

export function decodeTokenClaims(token: string): Record<string, unknown> | null {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded !== 'object') return null;
  return decoded as Record<string, unknown>;
}
