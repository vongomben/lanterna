/**
 * Trim transparent padding from gameplay PNGs.
 *
 * Source (read-only): img/
 * Output (derived):    img/generated/
 *
 * Re-run: npm run trim-assets
 * Originals in img/ are never modified.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "img");
const outDir = path.join(srcDir, "generated");
const manifestGamePath = path.join(root, "src", "game", "spriteManifest.json");

/** @type {Array<{ key: string, source: string, out: string }>} */
const ASSETS = [
  { key: "robot", source: "robot_gripper_open.png", out: "robot.png" },
  { key: "robotCarry", source: "robot_gripper_carry.png", out: "robot_carry.png" },
  { key: "container", source: "alien_container.png", out: "container.png" },
  { key: "containerGlow", source: "alien_container_glow.png", out: "container_glow.png" },
  { key: "containerOpened", source: "alien_container_opened.png", out: "container_opened.png" },
  { key: "startMarker", source: "start_marker_A.png", out: "start_marker_A.png" },
  { key: "goalMarker", source: "goal_marker_B.png", out: "goal_marker_B.png" },
  { key: "floorClean", source: "floor_tile_clean.png", out: "floor_tile_clean.png" },
  { key: "floorWorn", source: "floor_tile_worn.png", out: "floor_tile_worn.png" },
  { key: "crateWood", source: "crate_wood.png", out: "crate_wood.png" },
  { key: "trafficCone", source: "traffic_cone.png", out: "traffic_cone.png" },
  { key: "technicalTerminal", source: "technical_terminal.png", out: "technical_terminal.png" },
];

fs.mkdirSync(outDir, { recursive: true });

/** @type {Record<string, object>} */
const manifest = {
  _meta: {
    description: "Derived sprites — trimmed visible bounds. Do not edit by hand.",
    sourceDir: "img/",
    outputDir: "img/generated/",
    generatedAt: new Date().toISOString(),
  },
};

for (const asset of ASSETS) {
  const input = path.join(srcDir, asset.source);
  const output = path.join(outDir, asset.out);

  const originalMeta = await sharp(input).metadata();
  const trimmed = sharp(input).trim({ threshold: 1 });
  const trimmedBuffer = await trimmed.png().toBuffer();
  const trimmedMeta = await sharp(trimmedBuffer).metadata();

  await fs.promises.writeFile(output, trimmedBuffer);

  manifest[asset.key] = {
    source: asset.source,
    file: `generated/${asset.out}`,
    original: { width: originalMeta.width, height: originalMeta.height },
    trimmed: { width: trimmedMeta.width, height: trimmedMeta.height },
  };

  console.log(
    `${asset.key}: ${originalMeta.width}×${originalMeta.height} → ${trimmedMeta.width}×${trimmedMeta.height}`,
  );
}

const manifestOut = path.join(outDir, "manifest.json");
await fs.promises.writeFile(manifestOut, JSON.stringify(manifest, null, 2));
await fs.promises.writeFile(manifestGamePath, JSON.stringify(manifest, null, 2));

console.log(`\nWrote ${ASSETS.length} trimmed sprites to img/generated/`);
console.log(`Manifest: img/generated/manifest.json + src/game/spriteManifest.json`);
