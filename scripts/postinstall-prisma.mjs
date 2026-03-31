import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const projectRoot = path.resolve(currentDirectory, "..");
const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
const prismaBin = path.join(projectRoot, "node_modules", ".bin", "prisma");

if (!existsSync(schemaPath) || !existsSync(prismaBin)) {
  process.exit(0);
}

const result = spawnSync(prismaBin, ["generate"], {
  cwd: projectRoot,
  stdio: "inherit",
});

process.exit(result.status ?? 0);
