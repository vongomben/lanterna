import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = process.argv[2] || "dist";
fs.cpSync(path.join(root, "img"), path.join(root, outDir, "img"), { recursive: true });
