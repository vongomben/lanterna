/**
 * Game commands — independent from Blockly.
 * Called by keyboard (debug) and blockly/executor.
 */
import { DIRECTIONS, getFrontCell } from "./grid.js";
import { canMoveForward, canPlaceInFrontCell } from "./collision.js";
import { getState, setMissionCompleted } from "../state/gameState.js";
import { getActiveLevel, scenarioConfig } from "../data/scenario-config.js";
import { isPayloadOnGoal } from "./rules.js";
import {
  animateMove,
  animateTurn,
  animateActionFeedback,
  rebuildRobotVisual,
  showBlockedFeedback,
} from "./robot.js";
import {
  hidePayload,
  showPayloadAt,
  playPayloadSuccessSequence,
} from "./payload.js";

/** @typedef {import("./grid.js").Direction} Direction */

/**
 * @typedef {Object} CommandSuccess
 * @property {true} ok
 * @property {boolean} [terminal]
 * @property {string} [event]
 */

/**
 * @typedef {Object} CommandFailure
 * @property {false} ok
 * @property {{ code: string, message: string }} error
 */

/** @typedef {CommandSuccess | CommandFailure} CommandResult */

const copy = () => scenarioConfig.copy;

/**
 * @param {Direction} direction
 * @param {1 | -1} step
 */
function rotateDirection(direction, step) {
  const index = DIRECTIONS.indexOf(direction);
  return DIRECTIONS[(index + step + 4) % 4];
}

/**
 * @returns {Promise<CommandResult>}
 */
export async function forward() {
  const { robot } = getState();
  if (robot.moving) {
    return {
      ok: false,
      error: {
        code: "ROBOT_BUSY",
        message: copy().errors.robotBusy,
      },
    };
  }

  const check = canMoveForward(robot.row, robot.col, robot.direction);

  if (!check.ok) {
    showBlockedFeedback();
    return {
      ok: false,
      error: {
        code: "MOVEMENT_BLOCKED",
        message: copy().status.movementBlocked,
      },
    };
  }

  const { row, col } = check.target;
  robot.moving = true;

  await animateMove(row, col);

  robot.row = row;
  robot.col = col;
  robot.moving = false;
  return { ok: true };
}

/**
 * @returns {Promise<CommandResult>}
 */
export async function turnLeft() {
  const { robot } = getState();
  if (robot.moving) {
    return {
      ok: false,
      error: {
        code: "ROBOT_BUSY",
        message: copy().errors.robotBusy,
      },
    };
  }

  const newDir = rotateDirection(robot.direction, -1);
  robot.moving = true;

  await animateTurn(newDir);

  robot.direction = newDir;
  robot.moving = false;
  return { ok: true };
}

/**
 * @returns {Promise<CommandResult>}
 */
export async function turnRight() {
  const { robot } = getState();
  if (robot.moving) {
    return {
      ok: false,
      error: {
        code: "ROBOT_BUSY",
        message: copy().errors.robotBusy,
      },
    };
  }

  const newDir = rotateDirection(robot.direction, 1);
  robot.moving = true;

  await animateTurn(newDir);

  robot.direction = newDir;
  robot.moving = false;
  return { ok: true };
}

/**
 * @returns {Promise<CommandResult>}
 */
export async function grab() {
  const state = getState();
  const { robot, payload } = state;

  if (robot.moving) {
    return {
      ok: false,
      error: {
        code: "ROBOT_BUSY",
        message: copy().errors.robotBusy,
      },
    };
  }

  if (robot.carrying) {
    return {
      ok: false,
      error: {
        code: "ALREADY_CARRYING",
        message: copy().errors.alreadyCarrying,
      },
    };
  }

  if (payload.carried) {
    return {
      ok: false,
      error: {
        code: "NOTHING_TO_GRAB",
        message: copy().errors.nothingToGrab,
      },
    };
  }

  const front = getFrontCell(robot);

  if (payload.row !== front.row || payload.col !== front.col) {
    return {
      ok: false,
      error: {
        code: "NOTHING_TO_GRAB",
        message: copy().errors.nothingToGrab,
      },
    };
  }

  robot.moving = true;

  robot.carrying = true;
  payload.carried = true;
  payload.row = null;
  payload.col = null;

  hidePayload();
  rebuildRobotVisual();
  await animateActionFeedback();

  robot.moving = false;
  return { ok: true };
}

/**
 * @returns {Promise<CommandResult>}
 */
export async function release() {
  const state = getState();
  const { robot, payload } = state;

  if (robot.moving) {
    return {
      ok: false,
      error: {
        code: "ROBOT_BUSY",
        message: copy().errors.robotBusy,
      },
    };
  }

  if (!robot.carrying || !payload.carried) {
    return {
      ok: false,
      error: {
        code: "NOT_CARRYING",
        message: copy().errors.notCarrying,
      },
    };
  }

  const check = canPlaceInFrontCell(robot.row, robot.col, robot.direction);

  if (!check.ok && check.reason === "bounds") {
    return {
      ok: false,
      error: {
        code: "RELEASE_OUT_OF_BOUNDS",
        message: copy().errors.releaseOutOfBounds,
      },
    };
  }

  if (!check.ok) {
    return {
      ok: false,
      error: {
        code: "RELEASE_BLOCKED",
        message: copy().errors.releaseBlocked,
      },
    };
  }

  const { row, col } = check.target;

  robot.moving = true;

  robot.carrying = false;
  payload.carried = false;
  payload.row = row;
  payload.col = col;

  rebuildRobotVisual();
  showPayloadAt(row, col);
  await animateActionFeedback();

  if (isPayloadOnGoal(state, getActiveLevel())) {
    setMissionCompleted();
    await playPayloadSuccessSequence();
    robot.moving = false;
    return {
      ok: true,
      terminal: true,
      event: "MISSION_COMPLETED",
    };
  }

  robot.moving = false;
  return { ok: true };
}

export const commands = {
  forward,
  turnLeft,
  turnRight,
  grab,
  release,
};
