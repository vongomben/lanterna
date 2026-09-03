const DEFAULTS = {
  homeUrl: "../",
  logoSrc: "../img/IT-Y-Flogo.png",
  logoAlt: "IT'S YOUR FUTURE",
};

/**
 * Barra sito: logo → home, testo → landing ateneo.
 * @param {Record<string, string> | undefined} nav
 */
export function mountSiteNav(nav = {}) {
  if (document.querySelector(".iyf-site-nav")) return;

  const homeUrl = nav.homeUrl || DEFAULTS.homeUrl;
  const logoSrc = nav.logoSrc || DEFAULTS.logoSrc;
  const logoAlt = nav.logoAlt || DEFAULTS.logoAlt;
  const percorsoLabel = nav.percorsoLabel;
  const percorsoUrl = nav.percorsoUrl;

  const bar = document.createElement("nav");
  bar.className = "iyf-site-nav";
  bar.setAttribute("aria-label", "Navigazione sito");

  const homeLink = document.createElement("a");
  homeLink.className = "iyf-site-nav__home";
  homeLink.href = homeUrl;
  homeLink.setAttribute("aria-label", "Torna alla home IT'S YOUR FUTURE");

  const logo = document.createElement("img");
  logo.className = "iyf-site-nav__logo";
  logo.src = logoSrc;
  logo.alt = logoAlt;
  homeLink.append(logo);
  bar.append(homeLink);

  if (percorsoLabel && percorsoUrl) {
    const percorso = document.createElement("a");
    percorso.className = "iyf-site-nav__percorso";
    percorso.href = percorsoUrl;
    percorso.textContent = percorsoLabel;
    bar.append(percorso);
  }

  document.body.prepend(bar);
}
