#!/usr/bin/env node
/**
 * Runs bddgen + playwright test with ENV from framework.config.json.
 *
 * Examples:
 *   npm test
 *   npm test -- stage
 *   npm test -- --env val
 *   npm run test:smoke -- qa
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(resolve(root, 'framework.config.json'), 'utf8'));
const environments = config.environments ?? [];
const aliases = config.envAliases ?? {};
const defaultEnv = config.defaultEnv ?? environments[0];

function resolveEnvName(raw) {
  const name = (raw ?? defaultEnv).toLowerCase();
  return aliases[name] ?? name;
}

function parseArgs(argv) {
  let envName = resolveEnvName(process.env.ENV ?? defaultEnv);
  let tags;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--env' && argv[i + 1]) {
      envName = resolveEnvName(argv[++i]);
      continue;
    }
    if (arg === '--tags' && argv[i + 1]) {
      tags = argv[++i];
      continue;
    }
    if (arg.startsWith('--tags=')) {
      tags = arg.slice('--tags='.length);
      continue;
    }
    if (arg.startsWith('@')) {
      tags = arg;
      continue;
    }
    if (!arg.startsWith('-')) {
      envName = resolveEnvName(arg);
    }
  }

  return { envName, tags };
}

function run(command, args, env) {
  const result = spawnSync(command, args, {
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: process.platform === 'win32',
    cwd: root,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const { envName, tags } = parseArgs(process.argv.slice(2));

if (!environments.includes(envName)) {
  console.error(
    `Invalid environment "${envName}". Use one of: ${environments.join(', ')} (e.g. npm test -- ${environments[0]})`,
  );
  process.exit(1);
}

console.log(`[test-runner] ENV=${envName}${tags ? ` tags=${tags}` : ''}`);

const childEnv = { ENV: envName };
const bddgenArgs = ['bddgen'];
if (tags) {
  bddgenArgs.push('--tags', tags);
}

run('npx', bddgenArgs, childEnv);
run('npx', ['playwright', 'test'], childEnv);
