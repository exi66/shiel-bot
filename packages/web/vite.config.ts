import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Корень монорепо (там лежат .env и package.json).
const rootDir = path.resolve(__dirname, '..', '..');

// Ссылка на репозиторий берётся из корневого package.json (поле repository).
function readGitUrl(): string {
  try {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const url = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url;
    return url ? url.replace(/^git\+/, '').replace(/\.git$/, '') : '';
  } catch {
    return '';
  }
}

export default defineConfig(({ mode }) => {
  // Грузим корневой .env (без префикса — забираем и не-VITE переменные).
  const env = loadEnv(mode, rootDir, '');

  return {
    plugins: [react()],
    define: {
      __GIT_URL__: JSON.stringify(readGitUrl()),
      __DISCORD_CLIENT_ID__: JSON.stringify(env.DISCORD_CLIENT_ID ?? ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      // Проксируем API на Express-сервер во время разработки.
      proxy: {
        '/api': 'http://localhost:3000',
      },
    },
  };
});
