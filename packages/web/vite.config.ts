import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { rootDir, readGitUrl } from "@shiel/shared/meta";

export default defineConfig(({ mode }) => {
  // Грузим корневой .env (без префикса — забираем и не-VITE переменные).
  const env = loadEnv(mode, rootDir, "");

  return {
    plugins: [react()],
    define: {
      __GIT_URL__: JSON.stringify(readGitUrl()),
      __DISCORD_CLIENT_ID__: JSON.stringify(env.DISCORD_CLIENT_ID ?? ""),
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    server: {
      // Проксируем API на Express-сервер во время разработки.
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
  };
});
