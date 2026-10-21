/**
 * Mission completed overlay — HTML/CSS, not KAPLAY canvas.
 */
import { scenarioConfig } from "../data/scenario-config.js";
import { getAttempts } from "../state/sessionState.js";

/**
 * Punteggio a stelle comune ai giochi IT'S YOUR FUTURE: soglie[i] = esecuzioni massime per (5 - i) stelle.
 * 1 esecuzione → 5, 2 → 4, 3–4 → 3, 5–7 → 2, 8+ → 1. Sovrascrivibile da scenarioConfig.punteggio.soglie.
 */
const SOGLIE_STELLE = [1, 2, 4, 7];

function calcolaStelle(esecuzioni) {
  const soglie = scenarioConfig.punteggio?.soglie ?? SOGLIE_STELLE;
  const i = soglie.findIndex((max) => esecuzioni <= max);
  return i === -1 ? 1 : 5 - i;
}

/** @type {HTMLElement | null} */
let overlayEl = null;

/** @type {(() => void) | null} */
let retryHandler = null;

/** @type {HTMLElement | null} */
let previouslyFocusedEl = null;

/**
 * @param {() => void} onRetry
 */
export function initSuccessOverlay(onRetry) {
  retryHandler = onRetry;
  overlayEl = document.getElementById("success-overlay");
  const btn = document.getElementById("btn-success-retry");

  btn?.addEventListener("click", () => {
    hideSuccessOverlay();
    retryHandler?.();
  });
}

function renderScore() {
  const wrap = document.getElementById("success-score");
  if (!wrap) return;
  const stelle = calcolaStelle(getAttempts());
  wrap.setAttribute("aria-label", `Punteggio: ${stelle} stelle su 5`);
  wrap.querySelectorAll(".score__star").forEach((star, i) => {
    star.classList.toggle("score__star--on", i < stelle);
  });
}

export function showSuccessOverlay() {
  previouslyFocusedEl =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  renderScore();
  overlayEl?.classList.add("success-overlay--visible");
  overlayEl?.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => {
    document.getElementById("btn-success-retry")?.focus();
  });
}

export function hideSuccessOverlay() {
  overlayEl?.classList.remove("success-overlay--visible");
  overlayEl?.setAttribute("aria-hidden", "true");
  previouslyFocusedEl?.focus();
  previouslyFocusedEl = null;
}

export function isSuccessOverlayVisible() {
  return overlayEl?.classList.contains("success-overlay--visible") ?? false;
}
