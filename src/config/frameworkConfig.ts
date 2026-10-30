import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

const frameworkConfigSchema = z.object({
  projectName: z.string().default('api-tests'),
  environments: z.array(z.string().min(1)).min(1),
  defaultEnv: z.string().min(1),
  envAliases: z.record(z.string()).default({}),
  services: z.record(z.string()).default({ api: 'BASE_URL' }),
  mockServer: z
    .object({
      enabledEnv: z.string().default('START_MOCK_AUTH'),
      command: z.string(),
      urlEnv: z.string().default('AUTH_BASE_URL'),
      healthPath: z.string().default('/health'),
    })
    .optional(),
});

export type FrameworkConfig = z.infer<typeof frameworkConfigSchema>;

let cached: FrameworkConfig | undefined;

export function loadFrameworkConfig(root = process.cwd()): FrameworkConfig {
  if (cached) return cached;
  const path = resolve(root, 'framework.config.json');
  if (!existsSync(path)) {
    throw new Error(
      `Missing framework.config.json at ${path}. Copy the sample from this repo and set environments/services for your project.`,
    );
  }
  const parsed = frameworkConfigSchema.safeParse(JSON.parse(readFileSync(path, 'utf8')));
  if (!parsed.success) {
    throw new Error(`Invalid framework.config.json: ${parsed.error.message}`);
  }
  if (!parsed.data.environments.includes(parsed.data.defaultEnv)) {
    throw new Error(
      `framework.config.json defaultEnv "${parsed.data.defaultEnv}" is not in environments`,
    );
  }
  cached = parsed.data;
  return cached;
}

export function resolveTargetEnv(raw: string | undefined, config = loadFrameworkConfig()): string {
  const name = (raw ?? config.defaultEnv).toLowerCase();
  const resolved = config.envAliases[name] ?? name;
  if (!config.environments.includes(resolved)) {
    throw new Error(
      `Invalid ENV "${raw}". Allowed: ${config.environments.join(', ')} (aliases: ${Object.keys(config.envAliases).join(', ') || 'none'})`,
    );
  }
  return resolved;
}
