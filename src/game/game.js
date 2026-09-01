/**
 * KAPLAY init, level scene, keyboard debug controls, level reset.
 */
import kaplay from "kaplay";
import { getActiveLevel } from "../data/scenario-config.js";
import { resetState } from "../state/gameState.js";
import { initCollision } from "./collision.js";
import { loadGameAssets } from "./assets.js";
import { renderLevel } from "./level.js";
import { createRobot, rebuildRobotVisual } from "./robot.js";
import { resetPayloadVisual, syncPayloadVisual } from "./payload.js";
import { commands } from "./commands.js";
import { getBoardWidth, getBoardHeight } from "./grid.js";
import { showStatus } from "../ui/messages.js";

/** @type {import("kaplay").KAPLAYCtx | null} */
let k = null;

/**
 * @param {HTMLElement} root
 */
export function initGame(root) {
  const level = getActiveLevel();
  const boardW = getBoardWidth(level.cols);
  const boardH = getBoardHeight(level.rows);

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

  k.scene("level", () => {
    startLevelScene();
  });

  k.go("level");
  return k;
}

function startLevelScene() {
  const level = getActiveLevel();
  resetState();
  initCollision(level);
  renderLevel(k, level);
  createRobot(k);
  setupKeyboard(k);
}

/** Reset simulation to the active level initial state (Blockly program unchanged). */
export function resetLevel() {
  resetState();
  rebuildRobotVisual();
  resetPayloadVisual();
  syncPayloadVisual();
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
