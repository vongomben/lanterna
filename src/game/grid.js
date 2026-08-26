/**
 * Grid constants, coordinate conversion, visual scale helpers.
 * TILE_SIZE is the single reference unit — do not duplicate elsewhere.
 */

export const TILE_SIZE = 64;

/**
 * Visible footprint as fraction of TILE_SIZE (after transparent trim).
 * Percentages refer to trimmed bounding box, not full PNG canvas.
 */
export const VISUAL_SCALE = Object.freeze({
  robot: 0.76,
  container: 0.55,
  marker: 0.86,
  crate: 0.45,
  terminal: 0.38,
  cone: 0.22,
});

/** Edge wall thickness (~10–14% of cell). */
export const WALL_THICKNESS = TILE_SIZE * 0.12;

/** Set to true to show grid / logical-wall diagnostics. */
export const DEBUG_GRID = false;

/** @typedef {"top"|"right"|"bottom"|"left"} Side */
/** @typedef {"up"|"right"|"down"|"left"} Direction */

/** @param {number} cols */
export function getBoardWidth(cols) {
  return cols * TILE_SIZE;
}

/** @param {number} rows */
export function getBoardHeight(rows) {
  return rows * TILE_SIZE;
}

/**
 * Uniform scale: largest trimmed dimension → cell fraction.
 * @param {number} visualFraction
 * @param {number} nativeW
 * @param {number} nativeH
 */
export function scaleToCellFraction(visualFraction, nativeW, nativeH) {
  const maxDim = TILE_SIZE * visualFraction;
  return maxDim / Math.max(nativeW, nativeH);
}

/**
 * Centre of a grid cell in world (pixel) coordinates.
 * @param {number} row
 * @param {number} col
 */
export function gridToWorld(row, col) {
  return {
    x: col * TILE_SIZE + TILE_SIZE / 2,
    y: row * TILE_SIZE + TILE_SIZE / 2,
  };
}

/**
 * @param {number} x
 * @param {number} y
 */
export function worldToGrid(x, y) {
  return {
    row: Math.floor(y / TILE_SIZE),
    col: Math.floor(x / TILE_SIZE),
  };
}

/** @type {Record<Direction, { row: number, col: number }>} */
export const DIRECTION_DELTA = {
  up: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
};

/** @type {Direction[]} */
export const DIRECTIONS = ["up", "right", "down", "left"];

/** @type {Record<Direction, Side>} */
export const DIRECTION_TO_SIDE = {
  up: "top",
  right: "right",
  down: "bottom",
  left: "left",
};

/** @type {Record<Side, Side>} */
export const OPPOSITE_SIDE = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/**
 * Front cell of the robot (pinza direction).
 * @param {{ row: number, col: number, direction: Direction }} robot
 * @returns {{ row: number, col: number }}
 */
export function getFrontCell(robot) {
  const delta = DIRECTION_DELTA[robot.direction];
  return {
    row: robot.row + delta.row,
    col: robot.col + delta.col,
  };
}

/**
 * robot_gripper_open.png and robot_gripper_carry.png — gripper faces RIGHT at 0°.
 * Carry sprite uses the same angle mapping via directionToAngle().
 */
export const CARRY_SPRITE_BASE_DIRECTION = "right";

/**
 * Robot rotation — source sprite has gripper facing RIGHT at 0°.
 * @param {Direction} direction
 */
export function directionToAngle(direction) {
  switch (direction) {
    case "right":
      return 0;
    case "down":
      return 90;
    case "left":
      return 180;
    case "up":
      return -90;
  }
}

/**
 * World position and size for an edge wall segment.
 * @param {number} row
 * @param {number} col
 * @param {Side} side
 */
export function edgeWallGeometry(row, col, side) {
  const x0 = col * TILE_SIZE;
  const y0 = row * TILE_SIZE;
  const t = WALL_THICKNESS;

  switch (side) {
    case "top":
      return { x: x0 + TILE_SIZE / 2, y: y0, w: TILE_SIZE, h: t };
    case "bottom":
      return { x: x0 + TILE_SIZE / 2, y: y0 + TILE_SIZE, w: TILE_SIZE, h: t };
    case "left":
      return { x: x0, y: y0 + TILE_SIZE / 2, w: t, h: TILE_SIZE };
    case "right":
      return { x: x0 + TILE_SIZE, y: y0 + TILE_SIZE / 2, w: t, h: TILE_SIZE };
  }
}

/**
 * Centre line geometry for debug wall overlay (thin diagnostic line).
 * @param {number} row
 * @param {number} col
 * @param {Side} side
 */
export function edgeWallDebugLine(row, col, side) {
  const x0 = col * TILE_SIZE;
  const y0 = row * TILE_SIZE;

  switch (side) {
    case "top":
      return { x: x0 + TILE_SIZE / 2, y: y0, w: TILE_SIZE, h: 1 };
    case "bottom":
      return { x: x0 + TILE_SIZE / 2, y: y0 + TILE_SIZE, w: TILE_SIZE, h: 1 };
    case "left":
      return { x: x0, y: y0 + TILE_SIZE / 2, w: 1, h: TILE_SIZE };
    case "right":
      return { x: x0 + TILE_SIZE, y: y0 + TILE_SIZE / 2, w: 1, h: TILE_SIZE };
  }
}
