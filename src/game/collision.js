/**
 * Edge-wall collision — reads level border data, not sprite positions.
 */
import {
  DIRECTION_DELTA,
} from "./grid.js";
import { getState } from "../state/gameState.js";

/** @typedef {import("./grid.js").Side} Side */

/** @type {Set<string>} */
let edgeWalls = new Set();

/** @type {number} */
let gridRows = 0;

/** @type {number} */
let gridCols = 0;

/** Static occupied cells, such as solid level props. */
/** @type {Set<string>} */
let occupiedCells = new Set();

/** @param {number} row @param {number} col */
function cellKey(row, col) {
  return `${row},${col}`;
}

/** @param {number} row @param {number} col @param {Side} side */
function edgeKey(row, col, side) {
  return `${row},${col},${side}`;
}

/**
 * Props are solid by default; set `blocking: false` for decorative props.
 * @param {{ rows: number, cols: number, walls: Array<{ row: number, col: number, side: Side }>, props?: Array<{ row: number, col: number, blocking?: boolean }> }} level
 */
export function initCollision(level) {
  gridRows = level.rows;
  gridCols = level.cols;
  edgeWalls = new Set(level.walls.map((w) => edgeKey(w.row, w.col, w.side)));
  occupiedCells = new Set(
    (level.props ?? [])
      .filter((prop) => prop.blocking !== false)
      .map((prop) => cellKey(prop.row, prop.col)),
  );
}

/**
 * Check dynamic and static occupants independently from wall geometry.
 * @param {number} row
 * @param {number} col
 * @param {{ ignorePayload?: boolean }} [options]
 */
export function getCellOccupant(row, col, { ignorePayload = false } = {}) {
  if (occupiedCells.has(cellKey(row, col))) {
    return "prop";
  }

  if (!ignorePayload) {
    const { payload } = getState();
    if (!payload.carried && payload.row === row && payload.col === col) {
      return "payload";
    }
  }

  return null;
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

  const occupant = getCellOccupant(target.row, target.col);
  if (occupant) {
    return { ok: false, reason: "occupied", occupant, target };
  }

  return { ok: true, target };
}

/**
 * Can the robot place the payload in the cell ahead (release target)?
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

  const occupant = getCellOccupant(target.row, target.col, {
    ignorePayload: true,
  });
  if (occupant) {
    return { ok: false, reason: "occupied", occupant, target };
  }

  return { ok: true, target };
}
