/**
 * Robot entity — visual representation synced from gameState.
 */
import { gridToWorld, directionToAngle, VISUAL_SCALE } from "./grid.js";
import { getState } from "../state/gameState.js";
import { spriteScale } from "./assets.js";
import { Z } from "./level.js";

const MOVE_DURATION = 0.3;
const TURN_DURATION = 0.2;
const ACTION_DURATION = 0.28;

/** @type {import("kaplay").GameObj | null} */
let robotObj = null;

/** @type {import("kaplay").KAPLAYCtx | null} */
let k = null;

/**
 * @param {import("kaplay").KAPLAYCtx} ctx
 */
export function createRobot(ctx) {
  k = ctx;
  rebuildRobotVisual();
  return robotObj;
}

export function getRobotObject() {
  return robotObj;
}

/** Destroy and recreate robot sprite (open vs carry). */
export function rebuildRobotVisual() {
  if (!k) return;

  const state = getState();
  const { robot } = state;
  const { x, y } = gridToWorld(robot.row, robot.col);
  const carrying = robot.carrying;
  const manifestKey = carrying ? "robotCarry" : "robot";
  const spriteName = carrying ? "robotCarry" : "robot";
  const robotScale = spriteScale(manifestKey, VISUAL_SCALE.robot);

  if (robotObj) {
    k.destroy(robotObj);
    robotObj = null;
  }

  robotObj = k.add([
    k.sprite(spriteName),
    k.pos(x, y),
    k.anchor("center"),
    k.scale(robotScale),
    k.rotate(directionToAngle(robot.direction)),
    k.z(Z.ROBOT),
    "robot",
    { baseScale: robotScale, carrying },
  ]);
}

/** Sync sprite transform from logical state (instant). */
export function syncRobotVisual() {
  if (!robotObj || !k) return;

  const { robot } = getState();

  if (robotObj.carrying !== robot.carrying) {
    rebuildRobotVisual();
    return;
  }

  const { x, y } = gridToWorld(robot.row, robot.col);
  robotObj.pos = k.vec2(x, y);
  robotObj.angle = directionToAngle(robot.direction);
}

/**
 * @param {number} toRow
 * @param {number} toCol
 */
export function animateMove(toRow, toCol) {
  return new Promise((resolve) => {
    if (!robotObj || !k) {
      resolve();
      return;
    }

    const target = gridToWorld(toRow, toCol);
    const start = { x: robotObj.pos.x, y: robotObj.pos.y };
    let elapsed = 0;

    const cancel = k.onUpdate(() => {
      elapsed += k.dt();
      const t = Math.min(elapsed / MOVE_DURATION, 1);

      robotObj.pos.x = start.x + (target.x - start.x) * t;
      robotObj.pos.y = start.y + (target.y - start.y) * t;

      if (t >= 1) {
        cancel.cancel();
        robotObj.pos = k.vec2(target.x, target.y);
        resolve();
      }
    });
  });
}

/**
 * @param {import("./grid.js").Direction} newDirection
 */
export function animateTurn(newDirection) {
  return new Promise((resolve) => {
    if (!robotObj || !k) {
      resolve();
      return;
    }

    const targetAngle = directionToAngle(newDirection);
    const startAngle = robotObj.angle;
    let diff = targetAngle - startAngle;

    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    let elapsed = 0;

    const cancel = k.onUpdate(() => {
      elapsed += k.dt();
      const t = Math.min(elapsed / TURN_DURATION, 1);

      robotObj.angle = startAngle + diff * t;

      if (t >= 1) {
        cancel.cancel();
        robotObj.angle = targetAngle;
        resolve();
      }
    });
  });
}

/** Brief feedback for grab / release. */
export function animateActionFeedback() {
  return new Promise((resolve) => {
    if (!robotObj || !k) {
      resolve();
      return;
    }

    const base = robotObj.baseScale ?? 1;
    let elapsed = 0;

    const cancel = k.onUpdate(() => {
      elapsed += k.dt();
      const t = Math.min(elapsed / ACTION_DURATION, 1);
      const pulse = 1 + Math.sin(t * Math.PI) * 0.04;
      robotObj.scale = k.vec2(base * pulse, base * pulse);

      if (t >= 1) {
        cancel.cancel();
        robotObj.scale = k.vec2(base, base);
        resolve();
      }
    });
  });
}

/** Brief visual feedback when movement is blocked. */
export function showBlockedFeedback() {
  if (!robotObj || !k) return;

  const flash = k.add([
    k.rect(48, 48),
    k.pos(robotObj.pos.x, robotObj.pos.y),
    k.anchor("center"),
    k.color(220, 60, 60),
    k.opacity(0.45),
    k.z(Z.FX),
  ]);

  let elapsed = 0;
  const cancel = k.onUpdate(() => {
    elapsed += k.dt();
    flash.opacity = 0.45 * (1 - elapsed / 0.25);

    if (elapsed >= 0.25) {
      cancel.cancel();
      k.destroy(flash);
    }
  });

  const base = robotObj.baseScale ?? 1;
  robotObj.scale = k.vec2(base * 1.06, base * 1.06);
  k.wait(0.12, () => {
    if (robotObj) robotObj.scale = k.vec2(base, base);
  });
}
