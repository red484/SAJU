import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
const root = import.meta.dirname;
const output = path.join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of await readdir(root)) {
  if (/\.(html|css|js|json)$/.test(name) && name !== 'package.json') await cp(path.join(root, name), path.join(output, name));
}
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
console.log('Static site built in dist/');
