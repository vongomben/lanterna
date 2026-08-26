/**
 * Game rules — win/goal checks (no Blockly dependency).
 */
import { getState } from "../state/gameState.js";

/**
 * @param {{ container: { row: number | null, col: number | null, carried: boolean }, goal: { row: number, col: number } }} state
 * @param {{ goal: { row: number, col: number } }} level
 * @returns {boolean}
 */
export function isContainerOnGoal(state, level) {
  const { container, goal } = state;
  return (
    container.carried === false &&
    container.row === goal.row &&
    container.col === goal.col
  );
}

/**
 * @param {{ goal: { row: number, col: number } }} level
 * @returns {boolean}
 */
export function checkWinCondition(level) {
  return isContainerOnGoal(getState(), level);
}
