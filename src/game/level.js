/**
 * Level rendering — floor, markers, edge walls (primitives), props, container.
 */
import {
  TILE_SIZE,
  gridToWorld,
  DEBUG_GRID,
  VISUAL_SCALE,
  edgeWallGeometry,
  edgeWallDebugLine,
} from "./grid.js";
import { getEdgeWalls } from "./collision.js";
import {
  PROP_VISUAL_SCALE,
  PROP_SPRITE_MAP,
  PROP_MANIFEST_KEY,
  spriteScale,
  floorScale,
} from "./assets.js";
import { createContainer } from "./container.js";
import { getState } from "../state/gameState.js";

/** @enum {number} */
const Z = {
  FLOOR: 0,
  MARKER: 1,
  WALL: 2,
  PROP: 3,
  CONTAINER: 4,
  ROBOT: 5,
  FX: 10,
  DEBUG: 20,
};

export { Z };

const WALL_BODY = [18, 42, 56];
const WALL_HIGHLIGHT = [42, 88, 110];
const WALL_ACCENT = [232, 146, 10];

/**
 * @param {import("kaplay").KAPLAYCtx} k
 * @param {import("../levels/level01.js").level01} level
 */
export function renderLevel(k, level) {
  renderFloor(k, level);
  renderMarkers(k, level);
  renderEdgeWalls(k, level);
  renderProps(k, level);
  createContainer(k, level.container.row, level.container.col);

  if (DEBUG_GRID) {
    renderDebugOverlay(k, level);
  }
}

/**
 * @param {import("kaplay").KAPLAYCtx} k
 * @param {{ rows: number, cols: number }} level
 */
function renderFloor(k, level) {
  const scale = floorScale();

  for (let row = 0; row < level.rows; row++) {
    for (let col = 0; col < level.cols; col++) {
      const useWorn = (row * 3 + col * 2) % 7 === 0;
      const spriteName = useWorn ? "floorWorn" : "floorClean";
      const { x, y } = gridToWorld(row, col);

      k.add([
        k.sprite(spriteName),
        k.pos(x, y),
        k.anchor("center"),
        k.scale(scale),
        k.z(Z.FLOOR),
        "floor-tile",
      ]);
    }
  }
}

/**
 * @param {import("kaplay").KAPLAYCtx} k
 * @param {{ start: { row: number, col: number }, goal: { row: number, col: number } }} level
 */
function renderMarkers(k, level) {
  drawMarker(k, level.start.row, level.start.col, "startMarker");
  drawMarker(k, level.goal.row, level.goal.col, "goalMarker");
}

/**
 * @param {import("kaplay").KAPLAYCtx} k
 * @param {number} row
 * @param {number} col
 * @param {"startMarker"|"goalMarker"} manifestKey
 */
function drawMarker(k, row, col, manifestKey) {
  const { x, y } = gridToWorld(row, col);
  k.add([
    k.sprite(manifestKey === "startMarker" ? "startMarker" : "goalMarker"),
    k.pos(x, y),
    k.anchor("center"),
    k.scale(spriteScale(manifestKey, VISUAL_SCALE.marker)),
    k.z(Z.MARKER),
    "marker",
  ]);
}

/**
 * @param {import("kaplay").KAPLAYCtx} k
 * @param {{ walls: Array<{ row: number, col: number, side: import("./grid.js").Side }> }} level
 */
function renderEdgeWalls(k, level) {
  for (const wall of level.walls) {
    drawEdgeWall(k, wall.row, wall.col, wall.side);
  }
}

/**
 * @param {import("kaplay").KAPLAYCtx} k
 * @param {number} row
 * @param {number} col
 * @param {import("./grid.js").Side} side
 */
function drawEdgeWall(k, row, col, side) {
  const { x, y, w, h } = edgeWallGeometry(row, col, side);

  k.add([
    k.rect(w, h),
    k.pos(x, y),
    k.anchor("center"),
    k.color(...WALL_BODY),
    k.z(Z.WALL),
    "wall-geom",
  ]);

  const hiW = side === "left" || side === "right" ? Math.max(1, w * 0.35) : w * 0.92;
  const hiH = side === "top" || side === "bottom" ? Math.max(1, h * 0.35) : h * 0.92;
  const hiOffset =
    side === "top"
      ? { ox: 0, oy: h * 0.15 }
      : side === "bottom"
        ? { ox: 0, oy: -h * 0.15 }
        : side === "left"
          ? { ox: w * 0.15, oy: 0 }
          : { ox: -w * 0.15, oy: 0 };

  k.add([
    k.rect(hiW, hiH),
    k.pos(x + hiOffset.ox, y + hiOffset.oy),
    k.anchor("center"),
    k.color(...WALL_HIGHLIGHT),
    k.z(Z.WALL + 0.1),
    "wall-highlight",
  ]);

  if ((row + col) % 5 === 0) {
    k.add([
      k.rect(Math.max(2, w * 0.12), Math.max(2, h * 0.35)),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...WALL_ACCENT),
      k.opacity(0.55),
      k.z(Z.WALL + 0.2),
      "wall-accent",
    ]);
  }
}

/**
 * @param {import("kaplay").KAPLAYCtx} k
 * @param {{ props?: Array<{ row: number, col: number, type: string }> }} level
 */
function renderProps(k, level) {
  for (const prop of level.props ?? []) {
    const spriteName = PROP_SPRITE_MAP[prop.type];
    const visualKey = PROP_VISUAL_SCALE[prop.type];
    const manifestKey = PROP_MANIFEST_KEY[prop.type];
    if (!spriteName || !visualKey || !manifestKey) continue;

    const scale = spriteScale(manifestKey, VISUAL_SCALE[visualKey]);
    const { x, y } = gridToWorld(prop.row, prop.col);

    k.add([
      k.sprite(spriteName),
      k.pos(x, y),
      k.anchor("center"),
      k.scale(scale),
      k.z(Z.PROP),
      "prop",
    ]);
  }
}

/**
 * @param {import("kaplay").KAPLAYCtx} k
 * @param {{ rows: number, cols: number }} level
 */
function renderDebugOverlay(k, level) {
  const boardW = level.cols * TILE_SIZE;
  const boardH = level.rows * TILE_SIZE;
  const lineColor = k.rgb(80, 120, 140);

  for (let col = 0; col <= level.cols; col++) {
    k.add([
      k.rect(1, boardH),
      k.pos(col * TILE_SIZE, 0),
      k.color(lineColor),
      k.opacity(0.22),
      k.z(Z.DEBUG),
      "debug-grid",
    ]);
  }

  for (let row = 0; row <= level.rows; row++) {
    k.add([
      k.rect(boardW, 1),
      k.pos(0, row * TILE_SIZE),
      k.color(lineColor),
      k.opacity(0.22),
      k.z(Z.DEBUG),
      "debug-grid",
    ]);
  }

  for (const wall of getEdgeWalls()) {
    const { x, y, w, h } = edgeWallDebugLine(wall.row, wall.col, wall.side);
    k.add([
      k.rect(w, h),
      k.pos(x, y),
      k.anchor("center"),
      k.color(255, 80, 80),
      k.opacity(0.55),
      k.z(Z.DEBUG + 1),
      "debug-wall-line",
    ]);
  }

  const robotHighlight = k.add([
    k.rect(TILE_SIZE - 4, TILE_SIZE - 4),
    k.pos(0, 0),
    k.anchor("center"),
    k.color(62, 207, 201),
    k.opacity(0.15),
    k.z(Z.DEBUG + 2),
    "debug-robot-cell",
  ]);

  const coordLabel = k.add([
    k.text("", { size: 9 }),
    k.pos(8, boardH - 14),
    k.color(180, 220, 210),
    k.z(Z.DEBUG + 3),
  ]);

  k.onUpdate(() => {
    const { robot } = getState();
    const { x, y } = gridToWorld(robot.row, robot.col);
    robotHighlight.pos = k.vec2(x, y);
    coordLabel.text = `robot ${robot.row},${robot.col} ${robot.direction}`;
  });

  for (let row = 0; row < level.rows; row++) {
    for (let col = 0; col < level.cols; col++) {
      k.add([
        k.text(`${row},${col}`, { size: 7 }),
        k.pos(col * TILE_SIZE + 3, row * TILE_SIZE + 2),
        k.color(160, 180, 190),
        k.opacity(0.4),
        k.z(Z.DEBUG),
        "debug-label",
      ]);
    }
  }
}
