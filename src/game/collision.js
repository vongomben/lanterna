/**
 * Edge-wall collision — reads level border data, not sprite positions.
 */
import {
  DIRECTION_DELTA,
  DIRECTION_TO_SIDE,
  OPPOSITE_SIDE,
} from "./grid.js";

/** @typedef {import("./grid.js").Side} Side */

/** @type {Set<string>} */
let edgeWalls = new Set();

/** @type {number} */
let gridRows = 0;

/** @type {number} */
let gridCols = 0;

/** @param {number} row @param {number} col @param {Side} side */
function edgeKey(row, col, side) {
  return `${row},${col},${side}`;
}

/**
 * @param {{ rows: number, cols: number, walls: Array<{ row: number, col: number, side: Side }> }} level
 */
export function initCollision(level) {
  gridRows = level.rows;
  gridCols = level.cols;
  edgeWalls = new Set(level.walls.map((w) => edgeKey(w.row, w.col, w.side)));
}

/** @param {number} row @param {number} col @param {Side} side */
export function hasEdgeWall(row, col, side) {
  return edgeWalls.has(edgeKey(row, col, side));
}

/** @returns {Array<{ row: number, col: number, side: Side }>} */
export function getEdgeWalls() {
  const result = [];
  for (const key of edgeWalls) {
    const [row, col, side] = key.split(",");
    result.push({ row: Number(row), col: Number(col), side: /** @type {Side} */ (side) });
  }
  return result;
}

/** @param {number} row @param {number} col */
export function isInBounds(row, col) {
  return row >= 0 && row < gridRows && col >= 0 && col < gridCols;
}

/**
 * @param {number} fromRow
 * @param {number} fromCol
 * @param {import("./grid.js").Direction} direction
 */
export function getTargetCell(fromRow, fromCol, direction) {
  const delta = DIRECTION_DELTA[direction];
  return {
    row: fromRow + delta.row,
    col: fromCol + delta.col,
  };
}

/**
 * @param {number} fromRow
 * @param {number} fromCol
 * @param {number} toRow
 * @param {number} toCol
 */
export function isBlockedByWall(fromRow, fromCol, toRow, toCol) {
  if (fromRow === toRow && fromCol < toCol) {
    return (
      hasEdgeWall(fromRow, fromCol, "right") ||
      hasEdgeWall(toRow, toCol, "left")
    );
  }
  if (fromRow === toRow && fromCol > toCol) {
    return (
      hasEdgeWall(fromRow, fromCol, "left") ||
      hasEdgeWall(toRow, toCol, "right")
    );
  }
  if (fromCol === toCol && fromRow < toRow) {
    return (
      hasEdgeWall(fromRow, fromCol, "bottom") ||
      hasEdgeWall(toRow, toCol, "top")
    );
  }
  if (fromCol === toCol && fromRow > toRow) {
    return (
      hasEdgeWall(fromRow, fromCol, "top") ||
      hasEdgeWall(toRow, toCol, "bottom")
    );
  }
  return true;
}

/**
 * @param {number} fromRow
 * @param {number} fromCol
 * @param {import("./grid.js").Direction} direction
 */
export function canMoveForward(fromRow, fromCol, direction) {
  const target = getTargetCell(fromRow, fromCol, direction);

  if (!isInBounds(target.row, target.col)) {
    return { ok: false, reason: "bounds", target };
  }

  if (isBlockedByWall(fromRow, fromCol, target.row, target.col)) {
    return { ok: false, reason: "wall", target };
  }

  return { ok: true, target };
}

/**
 * Can the robot place a container in the cell ahead (release target)?
 * Same wall/bounds rules as forward movement into that cell.
 *
 * @param {number} fromRow
 * @param {number} fromCol
 * @param {import("./grid.js").Direction} direction
 */
export function canPlaceInFrontCell(fromRow, fromCol, direction) {
  const target = getTargetCell(fromRow, fromCol, direction);

  if (!isInBounds(target.row, target.col)) {
    return { ok: false, reason: "bounds", target };
  }

  if (isBlockedByWall(fromRow, fromCol, target.row, target.col)) {
    return { ok: false, reason: "wall", target };
  }

  return { ok: true, target };
}
