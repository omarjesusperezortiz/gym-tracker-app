// GitHub Pages has no server-side rewrites, so a deep link (e.g. /gym-tracker-app/calendar)
// 404s unless we serve the SPA shell there too. Copying index.html to 404.html makes
// GitHub Pages fall back to the app for any unknown path, and App.tsx's router takes it from there.
import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(dir, '..', 'dist');
copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
console.log('Copied dist/index.html -> dist/404.html');
