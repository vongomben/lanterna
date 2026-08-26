/**
 * Level 01 — Deposito portuale (9×7).
 * Passage blocked by canonical edge walls ({ row, col, side }).
 */
import { level01Walls } from "./level01-walls.js";

export const level01 = {
  id: "level01",
  name: "Deposito",
  mission: "Estrai il container dal deposito",

  rows: 7,
  cols: 9,

  start: { row: 0, col: 0 },
  goal: { row: 6, col: 8 },

  /** Adjacent to container at (0,0); pinza must face left toward A. */
  robot: { row: 0, col: 1, direction: "left" },
  container: { row: 0, col: 0 },

  /** Definitive edge-wall list — see level01-walls.js */
  walls: level01Walls,

  props: [
    { row: 3, col: 0, type: "crate_wood" },
    { row: 5, col: 1, type: "traffic_cone" },
    { row: 1, col: 3, type: "technical_terminal" },
  ],
};
