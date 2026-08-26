/**
 * Initial splash screen — title, credits, Lanterna art, press-any-key to start.
 * Shown once on app load; does not affect timer, attempts, or level state.
 */

const FADE_MS = 450;

/** @type {boolean} */
let splashActive = true;

/** @type {boolean} */
let dismissing = false;

/** @type {HTMLElement | null} */
let splashEl = null;

/** @type {(() => void) | null} */
let onStartCallback = null;

/** @type {((event: KeyboardEvent) => void) | null} */
let keyHandler = null;

/** @type {((event: PointerEvent) => void) | null} */
let pointerHandler = null;

export function isSplashActive() {
  return splashActive || dismissing;
}

/**
 * @param {{ onStart?: () => void }} [options]
 */
export function initSplashScreen({ onStart } = {}) {
  onStartCallback = onStart ?? null;
  splashEl = document.getElementById("splash-screen");

  if (!splashEl) {
    splashActive = false;
    onStartCallback?.();
    return;
  }

  splashActive = true;
  dismissing = false;
  splashEl.classList.remove("splash-screen--hidden", "splash-screen--hiding");
  splashEl.classList.add("splash-screen--visible");
  splashEl.setAttribute("aria-hidden", "false");

  keyHandler = (event) => {
    if (!splashActive) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    hideSplashScreen();
  };

  pointerHandler = (event) => {
    if (!splashActive) {
      return;
    }
    event.preventDefault();
    hideSplashScreen();
  };

  window.addEventListener("keydown", keyHandler, true);
  splashEl.addEventListener("pointerdown", pointerHandler);
}

export function hideSplashScreen() {
  if (!splashActive || dismissing || !splashEl) {
    return;
  }

  dismissing = true;
  splashEl.classList.add("splash-screen--hiding");
  splashEl.classList.remove("splash-screen--visible");

  window.setTimeout(() => {
    splashActive = false;
    dismissing = false;

    splashEl.classList.add("splash-screen--hidden");
    splashEl.setAttribute("aria-hidden", "true");

    if (keyHandler) {
      window.removeEventListener("keydown", keyHandler, true);
      keyHandler = null;
    }
    if (pointerHandler) {
      splashEl.removeEventListener("pointerdown", pointerHandler);
      pointerHandler = null;
    }

    onStartCallback?.();
  }, FADE_MS);
}

/** Reset state for tests only. */
export function resetSplashScreenForTests() {
  splashActive = true;
  dismissing = false;
  splashEl = null;
  onStartCallback = null;
  keyHandler = null;
  pointerHandler = null;
}
