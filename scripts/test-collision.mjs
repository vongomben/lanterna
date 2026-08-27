/**
 * Grid occupancy and collision unit tests.
 */
import {
  canMoveForward,
  canPlaceInFrontCell,
  getCellOccupant,
  initCollision,
} from "../src/game/collision.js";
import { getState, resetState } from "../src/state/gameState.js";
import { DIRECTIONS } from "../src/game/grid.js";
import { level01 } from "../src/levels/level01.js";

/** @param {boolean} condition @param {string} name */
function assert(condition, name) {
  if (!condition) {
    console.error("FAIL:", name);
    process.exitCode = 1;
    return;
  }
  console.log("OK:", name);
}

resetState();
initCollision(level01);

const { robot, container } = getState();
const intoContainer = canMoveForward(robot.row, robot.col, robot.direction);
assert(intoContainer.ok === false, "container blocks robot movement");
assert(intoContainer.occupant === "container", "container occupant reported");

const firstProp = level01.props[0];
assert(
  getCellOccupant(firstProp.row, firstProp.col) === "prop",
  "solid prop occupies its cell",
);
const ontoProp = canPlaceInFrontCell(3, 1, "left");
assert(ontoProp.ok === false, "cannot release container onto solid prop");

container.carried = true;
container.row = null;
container.col = null;
assert(
  getCellOccupant(level01.container.row, level01.container.col) === null,
  "carried container frees its former cell",
);

function isLevelSolvable() {
  const queue = [
    {
      row: level01.robot.row,
      col: level01.robot.col,
      direction: level01.robot.direction,
    },
  ];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    const key = `${current.row},${current.col},${current.direction}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const release = canPlaceInFrontCell(
      current.row,
      current.col,
      current.direction,
    );
    if (
      release.ok &&
      release.target.row === level01.goal.row &&
      release.target.col === level01.goal.col
    ) {
      return true;
    }

    const directionIndex = DIRECTIONS.indexOf(current.direction);
    queue.push(
      {
        ...current,
        direction: DIRECTIONS[(directionIndex + 3) % 4],
      },
      {
        ...current,
        direction: DIRECTIONS[(directionIndex + 1) % 4],
      },
    );

    const forward = canMoveForward(
      current.row,
      current.col,
      current.direction,
    );
    if (forward.ok) {
      queue.push({
        row: forward.target.row,
        col: forward.target.col,
        direction: current.direction,
      });
    }
  }

  return false;
}

assert(isLevelSolvable(), "level remains solvable with solid props");

initCollision({
  rows: 2,
  cols: 2,
  walls: [],
  props: [{ row: 0, col: 1, blocking: false }],
});
assert(getCellOccupant(0, 1) === null, "decorative prop can be non-blocking");

if (process.exitCode) {
  console.error("\nSome collision tests failed.");
} else {
  console.log("\nAll collision tests passed.");
}
