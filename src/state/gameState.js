/**
 * Logical game state — independent from KAPLAY.
 */
import { level01 } from "../levels/level01.js";

/** @typedef {"playing"|"completed"} MissionStatus */
/** @typedef {"up"|"right"|"down"|"left"} Direction */

/**
 * Container on the grid has row/col; while carried row/col are null
 * (robot is the sole carrier — no duplicate logical position).
 *
 * @typedef {Object} ContainerState
 * @property {number | null} row
 * @property {number | null} col
 * @property {boolean} carried
 */

/**
 * @typedef {Object} GameState
 * @property {{ row: number, col: number, direction: Direction, carrying: boolean, moving: boolean }} robot
 * @property {ContainerState} container
 * @property {{ row: number, col: number }} start
 * @property {{ row: number, col: number }} goal
 * @property {{ status: MissionStatus }} mission
 */

/** @returns {GameState} */
export function createInitialState() {
  return initFromLevel(level01);
}

/**
 * @param {typeof level01} level
 * @returns {GameState}
 */
export function initFromLevel(level) {
  return {
    robot: {
      row: level.robot.row,
      col: level.robot.col,
      direction: level.robot.direction,
      carrying: false,
      moving: false,
    },
    container: {
      row: level.container.row,
      col: level.container.col,
      carried: false,
    },
    start: { row: level.start.row, col: level.start.col },
    goal: { row: level.goal.row, col: level.goal.col },
    mission: { status: "playing" },
  };
}

/** @type {GameState} */
export let state = createInitialState();

export function resetState() {
  state = createInitialState();
  return state;
}

export function getState() {
  return state;
}

export function isMissionCompleted() {
  return state.mission.status === "completed";
}

export function setMissionCompleted() {
  state.mission.status = "completed";
}
