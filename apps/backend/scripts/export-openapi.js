import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openApiSpec } from '../src/config/openapi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '../../../packages/shared/src/generated/openapi.json');

fs.writeFileSync(outPath, JSON.stringify(openApiSpec, null, 2));
console.log(`Exported OpenAPI spec to ${outPath}`);