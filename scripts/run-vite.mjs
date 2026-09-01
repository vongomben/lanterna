import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scenario = process.argv[2] === "nautica" ? "nautica" : "lanterna";
const task = process.argv[3] === "build" ? "build" : "dev";
const outDir = process.argv[4] || (task === "build" ? "dist" : undefined);

const env = {
  ...process.env,
  VITE_SCENARIO: scenario,
};
if (outDir) {
  env.VITE_OUT_DIR = outDir;
}

const viteCli = path.join(root, "node_modules", "vite", "bin", "vite.js");
const viteArgs = task === "build" ? [viteCli, "build"] : [viteCli];

const vite = spawnSync(process.execPath, viteArgs, {
  cwd: root,
  env,
  stdio: "inherit",
});

if (vite.status !== 0) {
  process.exit(vite.status ?? 1);
}

if (task === "build") {
  const copy = spawnSync(
    process.execPath,
    [path.join(root, "scripts", "copy-img.mjs"), outDir || "dist"],
    { cwd: root, stdio: "inherit" },
  );
  process.exit(copy.status ?? 0);
}
