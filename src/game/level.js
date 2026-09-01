/**
 * Level rendering — floor, markers, edge walls, props, payload.
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
import { createPayload } from "./payload.js";
import { getState } from "../state/gameState.js";
import { scenarioConfig, usesPlaceholderVisuals } from "../data/scenario-config.js";

/** @enum {number} */
const Z = {
  FLOOR: 0,
  MARKER: 1,
  WALL: 2,
  PROP: 3,
  PAYLOAD: 4,
  ROBOT: 5,
  FX: 10,
  DEBUG: 20,
};

export { Z };

const WALL_BODY = [18, 42, 56];
const WALL_HIGHLIGHT = [42, 88, 110];
const WALL_ACCENT = [232, 146, 10];

const PROP_PLACEHOLDER_COLORS = {
  crate_wood: [180, 140, 80],
  traffic_cone: [220, 90, 40],
  technical_terminal: [90, 140, 160],
};

/**
 * @param {import("kaplay").KAPLAYCtx} k
 * @param {ReturnType<typeof import("../data/scenario-config.js").getActiveLevel>} level
 */
export function renderLevel(k, level) {
  renderFloor(k, level);
  renderMarkers(k, level);
  renderEdgeWalls(k, level);
  renderProps(k, level);
  createPayload(k, level.payload.row, level.payload.col);

  if (DEBUG_GRID) {
    renderDebugOverlay(k, level);
  }
}

/**
 * @param {import("kaplay").KAPLAYCtx} k
 * @param {{ rows: number, cols: number }} level
 */
function renderFloor(k, level) {
  if (usesPlaceholderVisuals()) {
    for (let row = 0; row < level.rows; row++) {
      for (let col = 0; col < level.cols; col++) {
        const { x, y } = gridToWorld(row, col);
        const shade = (row + col) % 2 === 0 ? 42 : 50;
        k.add([
          k.rect(TILE_SIZE - 1, TILE_SIZE - 1),
          k.pos(x, y),
          k.anchor("center"),
          k.color(shade, shade + 8, shade + 14),
          k.z(Z.FLOOR),
          "floor-tile",
        ]);
      }
    }
    return;
  }

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
  drawMarker(k, level.start.row, level.start.col, "start");
  drawMarker(k, level.goal.row, level.goal.col, "goal");
}

/**
 * @param {import("kaplay").KAPLAYCtx} k
 * @param {number} row
 * @param {number} col
 * @param {"start"|"goal"} kind
 */
function drawMarker(k, row, col, kind) {
  const { x, y } = gridToWorld(row, col);

  if (usesPlaceholderVisuals()) {
    const isStart = kind === "start";
    const label = isStart
      ? scenarioConfig.copy.placeholders.start
      : scenarioConfig.copy.placeholders.goal;
    const color = isStart ? [61, 154, 90] : [62, 207, 201];

    k.add([
      k.rect(TILE_SIZE * 0.82, TILE_SIZE * 0.82),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...color),
      k.opacity(0.35),
      k.z(Z.MARKER),
      "marker",
    ]);
    k.add([
      k.text(label, { size: 8, width: TILE_SIZE - 4, align: "center" }),
      k.pos(x, y),
      k.anchor("center"),
      k.color(247, 249, 251),
      k.z(Z.MARKER + 0.1),
    ]);
    return;
  }

  const manifestKey = kind === "start" ? "startMarker" : "goalMarker";
  k.add([
    k.sprite(manifestKey),
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
 * @param {{ props?: Array<{ row: number, col: number, type: string, label?: string }> }} level
 */
function renderProps(k, level) {
  for (const prop of level.props ?? []) {
    const { x, y } = gridToWorld(prop.row, prop.col);

    if (usesPlaceholderVisuals()) {
      const color = PROP_PLACEHOLDER_COLORS[prop.type] ?? [120, 120, 120];
      const label = prop.label ?? prop.type;
      k.add([
        k.rect(TILE_SIZE * 0.5, TILE_SIZE * 0.5),
        k.pos(x, y),
        k.anchor("center"),
        k.color(...color),
        k.z(Z.PROP),
        "prop",
      ]);
      k.add([
        k.text(label, { size: 7, width: TILE_SIZE - 8, align: "center" }),
        k.pos(x, y),
        k.anchor("center"),
        k.color(247, 249, 251),
        k.z(Z.PROP + 0.1),
      ]);
      continue;
    }

    const spriteName = PROP_SPRITE_MAP[prop.type];
    const visualKey = PROP_VISUAL_SCALE[prop.type];
    const manifestKey = PROP_MANIFEST_KEY[prop.type];
    if (!spriteName || !visualKey || !manifestKey) continue;

    const scale = spriteScale(manifestKey, VISUAL_SCALE[visualKey]);

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
