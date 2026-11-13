import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Корень монорепо: packages/shared/src -> ../../..
export const rootDir = path.resolve(__dirname, "..", "..", "..");

// Ссылка на репозиторий из корневого package.json (поле repository).
export function readGitUrl() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(rootDir, "package.json"), "utf8"),
    );
    const repo = pkg.repository;
    const url = typeof repo === "string" ? repo : repo?.url;
    if (!url) return "";
    return url.replace(/^git\+/, "").replace(/\.git$/, "");
  } catch {
    return "";
  }
}
