/**
 * Container entity — standalone sprite on the grid (hidden while carried).
 */
import { gridToWorld, VISUAL_SCALE } from "./grid.js";
import { getState } from "../state/gameState.js";
import { spriteScale } from "./assets.js";
import { Z } from "./level.js";

/** @type {import("kaplay").GameObj | null} */
let containerObj = null;

/** @type {import("kaplay").KAPLAYCtx | null} */
let k = null;

/** @type {"container"|"containerGlow"|"containerOpened"} */
let currentSprite = "container";

/**
 * @param {number} ms
 */
function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * @param {import("kaplay").KAPLAYCtx} ctx
 * @param {number} row
 * @param {number} col
 */
export function createContainer(ctx, row, col) {
  k = ctx;
  currentSprite = "container";
  spawnContainerAt(row, col, "container", "container");
  syncContainerVisual();
  return containerObj;
}

/**
 * @param {number} row
 * @param {number} col
 * @param {string} spriteName
 * @param {keyof import("./spriteManifest.json") & string} manifestKey
 */
function spawnContainerAt(row, col, spriteName, manifestKey) {
  if (!k) return;

  const { x, y } = gridToWorld(row, col);
  const scale = spriteScale(manifestKey, VISUAL_SCALE.container);

  if (containerObj) {
    k.destroy(containerObj);
  }

  containerObj = k.add([
    k.sprite(spriteName),
    k.pos(x, y),
    k.anchor("center"),
    k.scale(scale),
    k.z(Z.CONTAINER),
    "container",
  ]);

  currentSprite = /** @type {"container"|"containerGlow"|"containerOpened"} */ (
    spriteName
  );
}

/**
 * @param {"container"|"containerGlow"|"containerOpened"} spriteName
 * @param {keyof import("./spriteManifest.json") & string} manifestKey
 */
export function setContainerSprite(spriteName, manifestKey) {
  if (!containerObj || !k) return;

  const pos = containerObj.pos;
  const scale = spriteScale(manifestKey, VISUAL_SCALE.container);

  k.destroy(containerObj);

  containerObj = k.add([
    k.sprite(spriteName),
    k.pos(pos.x, pos.y),
    k.anchor("center"),
    k.scale(scale),
    k.z(Z.CONTAINER),
    "container",
  ]);

  currentSprite = spriteName;
}

export function getContainerObject() {
  return containerObj;
}

/** Sync visibility and position from gameState.container. */
export function syncContainerVisual() {
  if (!containerObj || !k) return;

  const { container } = getState();

  if (container.carried || container.row === null || container.col === null) {
    containerObj.hidden = true;
    return;
  }

  if (currentSprite !== "container") {
    setContainerSprite("container", "container");
  }

  const { x, y } = gridToWorld(container.row, container.col);
  containerObj.hidden = false;
  containerObj.pos = k.vec2(x, y);
}

/**
 * @param {number} row
 * @param {number} col
 */
export function showContainerAt(row, col) {
  if (!containerObj || !k) return;

  if (currentSprite !== "container") {
    setContainerSprite("container", "container");
  }

  const { x, y } = gridToWorld(row, col);
  containerObj.hidden = false;
  containerObj.pos = k.vec2(x, y);
}

export function hideContainer() {
  if (containerObj) {
    containerObj.hidden = true;
  }
}

/** Success feedback: normal → glow → opened (on goal B). */
export async function playContainerSuccessSequence() {
  await wait(200);
  setContainerSprite("containerGlow", "containerGlow");
  await wait(550);
  setContainerSprite("containerOpened", "containerOpened");
}

/** Restore normal container sprite (level reset). */
export function resetContainerVisual() {
  currentSprite = "container";
  if (!containerObj || !k) return;

  const { container } = getState();
  if (container.row !== null && container.col !== null) {
    spawnContainerAt(container.row, container.col, "container", "container");
  }
}
