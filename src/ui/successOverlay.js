/**
 * Mission completed overlay — HTML/CSS, not KAPLAY canvas.
 */

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

export function showSuccessOverlay() {
  previouslyFocusedEl =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
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
