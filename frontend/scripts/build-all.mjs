import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distRoot = join(root, 'dist');

rmSync(distRoot, { recursive: true, force: true });
mkdirSync(distRoot, { recursive: true });

console.log('Building customer app...');
execSync('npm run build -w @fast-bites/customer', { stdio: 'inherit', cwd: root });
cpSync(join(root, 'apps/customer/dist'), distRoot, { recursive: true });

console.log('Building vendor app...');
execSync('npm run build -w @fast-bites/vendor', { stdio: 'inherit', cwd: root });
mkdirSync(join(distRoot, 'vendor'), { recursive: true });
cpSync(join(root, 'apps/vendor/dist'), join(distRoot, 'vendor'), { recursive: true });

console.log('Combined build output written to dist/');
