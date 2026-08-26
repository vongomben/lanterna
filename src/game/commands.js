/**
 * Game commands — independent from Blockly.
 * Called by keyboard (debug) and blockly/executor.
 */
import { DIRECTIONS, getFrontCell } from "./grid.js";
import { canMoveForward, canPlaceInFrontCell } from "./collision.js";
import { getState, setMissionCompleted } from "../state/gameState.js";
import { level01 } from "../levels/level01.js";
import { isContainerOnGoal } from "./rules.js";
import {
  animateMove,
  animateTurn,
  animateActionFeedback,
  rebuildRobotVisual,
  showBlockedFeedback,
} from "./robot.js";
import {
  hideContainer,
  showContainerAt,
  playContainerSuccessSequence,
} from "./container.js";

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
        message: "Il robot è già in movimento.",
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
        message: "Movimento bloccato.",
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
        message: "Il robot è già in movimento.",
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
        message: "Il robot è già in movimento.",
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
  const { robot, container } = state;

  if (robot.moving) {
    return {
      ok: false,
      error: {
        code: "ROBOT_BUSY",
        message: "Il robot è già in movimento.",
      },
    };
  }

  if (robot.carrying) {
    return {
      ok: false,
      error: {
        code: "ALREADY_CARRYING",
        message: "Il robot sta già trasportando un container.",
      },
    };
  }

  if (container.carried) {
    return {
      ok: false,
      error: {
        code: "NOTHING_TO_GRAB",
        message: "Non c'è nessun container davanti alla pinza.",
      },
    };
  }

  const front = getFrontCell(robot);

  if (container.row !== front.row || container.col !== front.col) {
    return {
      ok: false,
      error: {
        code: "NOTHING_TO_GRAB",
        message: "Non c'è nessun container davanti alla pinza.",
      },
    };
  }

  robot.moving = true;

  robot.carrying = true;
  container.carried = true;
  container.row = null;
  container.col = null;

  hideContainer();
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
  const { robot, container } = state;

  if (robot.moving) {
    return {
      ok: false,
      error: {
        code: "ROBOT_BUSY",
        message: "Il robot è già in movimento.",
      },
    };
  }

  if (!robot.carrying || !container.carried) {
    return {
      ok: false,
      error: {
        code: "NOT_CARRYING",
        message: "Il robot non sta trasportando nessun container.",
      },
    };
  }

  const check = canPlaceInFrontCell(robot.row, robot.col, robot.direction);

  if (!check.ok && check.reason === "bounds") {
    return {
      ok: false,
      error: {
        code: "RELEASE_OUT_OF_BOUNDS",
        message: "Non puoi rilasciare il container fuori dall'area di gioco.",
      },
    };
  }

  if (!check.ok) {
    return {
      ok: false,
      error: {
        code: "RELEASE_BLOCKED",
        message: "Non puoi rilasciare il container in quella posizione.",
      },
    };
  }

  const { row, col } = check.target;

  robot.moving = true;

  robot.carrying = false;
  container.carried = false;
  container.row = row;
  container.col = col;

  rebuildRobotVisual();
  showContainerAt(row, col);
  await animateActionFeedback();

  if (isContainerOnGoal(state, level01)) {
    setMissionCompleted();
    await playContainerSuccessSequence();
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
