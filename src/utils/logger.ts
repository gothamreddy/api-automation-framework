import { env } from '../config/env.js';

const levels = { debug: 0, info: 1, warn: 2, error: 3 } as const;

function shouldLog(level: keyof typeof levels): boolean {
  return levels[level] >= levels[env.LOG_LEVEL];
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.debug('[debug]', ...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.info('[info]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn('[warn]', ...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error('[error]', ...args);
  },
};
