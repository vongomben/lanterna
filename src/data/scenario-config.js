/**
 * Active scenario — selected via VITE_SCENARIO=lanterna|nautica.
 */
import { scenarioConfig as lanternaConfig } from "./scenario-config.lanterna.js";
import { scenarioConfig as nauticaConfig } from "./scenario-config.nautica.js";

const SCENARIOS = Object.freeze({
  lanterna: lanternaConfig,
  nautica: nauticaConfig,
});

/**
 * @returns {"lanterna"|"nautica"}
 */
export function resolveScenarioId() {
  const env =
    (typeof import.meta.env === "object" && import.meta.env?.VITE_SCENARIO) ||
    (typeof process !== "undefined" ? process.env?.VITE_SCENARIO : undefined);
  return env === "nautica" ? "nautica" : "lanterna";
}

/** @type {typeof lanternaConfig} */
export const scenarioConfig = SCENARIOS[resolveScenarioId()] ?? lanternaConfig;

/** First (currently only) playable level of the active scenario. */
export function getActiveLevel() {
  return scenarioConfig.livelli[0];
}

export function usesPlaceholderVisuals() {
  return scenarioConfig.sprite.visualMode === "placeholders";
}

export { lanternaConfig, nauticaConfig };
