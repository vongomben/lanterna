/**
 * Apply scenario copy and splash art to the static HTML shell.
 */
import { setMission } from "./messages.js";

/**
 * @param {typeof import("../data/scenario-config.lanterna.js").scenarioConfig} config
 */
export function applyScenarioToDom(config) {
  const { meta, copy, sprite } = config;
  const level = config.livelli[0];

  document.title = meta.titolo;
  document.documentElement.dataset.scenario = meta.slug;

  setText("app-title", copy.headerTitle);
  setMission(level.istruzioni ?? copy.mission);

  setText("blockly-hint", copy.blocklyHint);
  setText("splash-title", copy.splash.title);
  setText("splash-credits", copy.splash.credits);
  setText("splash-cta", copy.splash.cta);
  setText("success-title", copy.success.title);
  setText("success-message", level.testoVittoria);

  applySplashArt(sprite, copy);
}

/**
 * @param {string} id
 * @param {string} text
 */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text != null) {
    el.textContent = text;
  }
}

/**
 * @param {typeof import("../data/scenario-config.lanterna.js").scenarioConfig.sprite} sprite
 * @param {typeof import("../data/scenario-config.lanterna.js").scenarioConfig.copy} copy
 */
function applySplashArt(sprite, copy) {
  const art = document.getElementById("splash-art");
  const bg = document.getElementById("splash-bg");
  const tower = document.getElementById("splash-tower");
  const placeholder = document.getElementById("splash-placeholder");
  const placeholderLabel = document.getElementById("splash-placeholder-label");

  const hasArt = Boolean(sprite.sfondo || sprite.splashTower);

  if (bg) {
    if (sprite.sfondo) {
      bg.src = sprite.sfondo.startsWith("/") ? sprite.sfondo : `/${sprite.sfondo}`;
      bg.hidden = false;
    } else {
      bg.hidden = true;
    }
  }

  if (tower) {
    if (sprite.splashTower) {
      tower.src = sprite.splashTower.startsWith("/")
        ? sprite.splashTower
        : `/${sprite.splashTower}`;
      tower.alt = sprite.splashTowerAlt ?? "";
      tower.hidden = false;
    } else {
      tower.hidden = true;
    }
  }

  if (placeholder) {
    placeholder.hidden = hasArt;
    if (placeholderLabel) {
      placeholderLabel.textContent = copy.placeholders?.splash ?? metaFallback(copy);
    }
  }

  art?.classList.toggle("splash-lanterna--placeholder", !hasArt);
}

function metaFallback(copy) {
  return copy.splash?.title ?? "";
}
