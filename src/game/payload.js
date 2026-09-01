/**
 * Payload entity — object to pick up / carry / release (sprites or placeholders).
 */
import { gridToWorld, TILE_SIZE, VISUAL_SCALE } from "./grid.js";
import { getState } from "../state/gameState.js";
import { spriteScale } from "./assets.js";
import { Z } from "./level.js";
import { scenarioConfig, usesPlaceholderVisuals } from "../data/scenario-config.js";

/** @type {import("kaplay").GameObj | null} */
let payloadObj = null;

/** @type {import("kaplay").GameObj | null} */
let payloadLabel = null;

/** @type {import("kaplay").KAPLAYCtx | null} */
let k = null;

/** @type {"idle"|"glow"|"opened"} */
let currentVariant = "idle";

const PAYLOAD_COLORS = {
  idle: [232, 146, 10],
  glow: [62, 207, 201],
  opened: [61, 154, 90],
};

/**
 * @param {number} ms
 */
function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function destroyPayload() {
  if (!k) return;
  if (payloadObj) {
    k.destroy(payloadObj);
    payloadObj = null;
  }
  if (payloadLabel) {
    k.destroy(payloadLabel);
    payloadLabel = null;
  }
}

/**
 * @param {import("kaplay").KAPLAYCtx} ctx
 * @param {number} row
 * @param {number} col
 */
export function createPayload(ctx, row, col) {
  k = ctx;
  currentVariant = "idle";
  spawnPayloadAt(row, col, "idle");
  syncPayloadVisual();
  return payloadObj;
}

/**
 * @param {number} row
 * @param {number} col
 * @param {"idle"|"glow"|"opened"} variant
 */
function spawnPayloadAt(row, col, variant) {
  if (!k) return;

  const { x, y } = gridToWorld(row, col);
  destroyPayload();

  if (usesPlaceholderVisuals()) {
    spawnPlaceholder(x, y, variant);
  } else {
    spawnSprite(x, y, variant);
  }

  currentVariant = variant;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {"idle"|"glow"|"opened"} variant
 */
function spawnPlaceholder(x, y, variant) {
  const size = TILE_SIZE * 0.72;
  const color = PAYLOAD_COLORS[variant] ?? PAYLOAD_COLORS.idle;
  const label = scenarioConfig.copy.placeholders.payload;

  payloadObj = k.add([
    k.rect(size, size * 0.62),
    k.pos(x, y),
    k.anchor("center"),
    k.color(...color),
    k.outline(2, k.rgb(20, 35, 48)),
    k.z(Z.PAYLOAD),
    "payload",
  ]);

  payloadLabel = k.add([
    k.text(label, { size: 7, width: TILE_SIZE - 8, align: "center" }),
    k.pos(x, y),
    k.anchor("center"),
    k.color(20, 35, 48),
    k.z(Z.PAYLOAD + 0.1),
    "payload-label",
  ]);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {"idle"|"glow"|"opened"} variant
 */
function spawnSprite(x, y, variant) {
  const spriteName =
    variant === "glow" ? "payloadGlow" : variant === "opened" ? "payloadOpened" : "payload";
  const manifestKey =
    variant === "glow" ? "containerGlow" : variant === "opened" ? "containerOpened" : "container";
  const scale = spriteScale(manifestKey, VISUAL_SCALE.payload);

  payloadObj = k.add([
    k.sprite(spriteName),
    k.pos(x, y),
    k.anchor("center"),
    k.scale(scale),
    k.z(Z.PAYLOAD),
    "payload",
  ]);
}

/**
 * @param {"idle"|"glow"|"opened"} variant
 */
export function setPayloadVariant(variant) {
  if (!payloadObj || !k) return;

  const pos = payloadObj.pos;
  spawnPayloadAtWorld(pos.x, pos.y, variant);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {"idle"|"glow"|"opened"} variant
 */
function spawnPayloadAtWorld(x, y, variant) {
  destroyPayload();

  if (usesPlaceholderVisuals()) {
    spawnPlaceholder(x, y, variant);
  } else {
    spawnSprite(x, y, variant);
  }

  currentVariant = variant;
}

export function getPayloadObject() {
  return payloadObj;
}

/** Sync visibility and position from gameState.payload. */
export function syncPayloadVisual() {
  if (!k) return;

  const { payload } = getState();

  if (payload.carried || payload.row === null || payload.col === null) {
    if (payloadObj) payloadObj.hidden = true;
    if (payloadLabel) payloadLabel.hidden = true;
    return;
  }

  if (currentVariant !== "idle") {
    spawnPayloadAt(payload.row, payload.col, "idle");
  }

  const { x, y } = gridToWorld(payload.row, payload.col);
  if (payloadObj) {
    payloadObj.hidden = false;
    payloadObj.pos = k.vec2(x, y);
  }
  if (payloadLabel) {
    payloadLabel.hidden = false;
    payloadLabel.pos = k.vec2(x, y);
  }
}

/**
 * @param {number} row
 * @param {number} col
 */
export function showPayloadAt(row, col) {
  if (!k) return;

  if (currentVariant !== "idle") {
    spawnPayloadAt(row, col, "idle");
  }

  const { x, y } = gridToWorld(row, col);
  if (payloadObj) {
    payloadObj.hidden = false;
    payloadObj.pos = k.vec2(x, y);
  }
  if (payloadLabel) {
    payloadLabel.hidden = false;
    payloadLabel.pos = k.vec2(x, y);
  }
}

export function hidePayload() {
  if (payloadObj) payloadObj.hidden = true;
  if (payloadLabel) payloadLabel.hidden = true;
}

/** Success feedback: idle → glow → opened (on goal B). */
export async function playPayloadSuccessSequence() {
  await wait(200);
  setPayloadVariant("glow");
  await wait(550);
  setPayloadVariant("opened");
}

/** Restore idle payload (level reset). */
export function resetPayloadVisual() {
  currentVariant = "idle";
  if (!k) return;

  const { payload } = getState();
  if (payload.row !== null && payload.col !== null) {
    spawnPayloadAt(payload.row, payload.col, "idle");
  }
}
