/**
 * KAPLAY init, level scene, keyboard debug controls, level reset.
 */
import kaplay from "kaplay";
import { level01 } from "../levels/level01.js";
import { resetState } from "../state/gameState.js";
import { initCollision } from "./collision.js";
import { loadGameAssets } from "./assets.js";
import { renderLevel } from "./level.js";
import { createRobot, rebuildRobotVisual } from "./robot.js";
import { resetContainerVisual, syncContainerVisual } from "./container.js";
import { commands } from "./commands.js";
import { getBoardWidth, getBoardHeight } from "./grid.js";
import { showStatus } from "../ui/messages.js";

/** @type {import("kaplay").KAPLAYCtx | null} */
let k = null;

/**
 * @param {HTMLElement} root
 */
export function initGame(root) {
  const boardW = getBoardWidth(level01.cols);
  const boardH = getBoardHeight(level01.rows);

  k = kaplay({
    global: false,
    root,
    width: boardW,
    height: boardH,
    background: [20, 35, 48],
    stretch: true,
    letterbox: true,
    crisp: true,
    touchToMouse: true,
  });

  loadGameAssets(k);

  k.scene("depot", () => {
    startDepotScene();
  });

  k.go("depot");
  return k;
}

function startDepotScene() {
  resetState();
  initCollision(level01);
  renderLevel(k, level01);
  createRobot(k);
  setupKeyboard(k);
}

/** Reset simulation to level01 initial state (Blockly program unchanged). */
export function resetLevel() {
  resetState();
  rebuildRobotVisual();
  resetContainerVisual();
  syncContainerVisual();
}

/** @type {() => boolean} */
let keyboardEnabled = () => true;

/**
 * @param {() => boolean} check
 */
export function setKeyboardEnabled(check) {
  keyboardEnabled = check;
}

function setupKeyboard(k) {
  const bind = (keys, action) => {
    k.onKeyPress(keys, async () => {
      if (!keyboardEnabled()) return;
      await action();
    });
  };

  bind(["w", "up"], async () => {
    const result = await commands.forward();
    if (!result.ok && result.error?.code === "MOVEMENT_BLOCKED") {
      showStatus(result.error.message);
    }
  });
  bind(["a", "left"], async () => {
    await commands.turnLeft();
  });
  bind(["d", "right"], async () => {
    await commands.turnRight();
  });
}

export function getKaplayContext() {
  return k;
}
