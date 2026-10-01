export type Theme = "dark" | "light";

export const THEME_KEY = "ndi-studio-theme";

/**
 * Run before first paint, from a blocking inline script in the document head.
 * Reading the stored theme in an effect instead would paint the dark default
 * first and then swap, which is the flash every themed app has to design out.
 *
 * Dark is the default rather than the OS preference: the Studio is a dark-first
 * product, and the atmosphere and glows are built for it. Light is a choice
 * someone makes with the toggle, not one their laptop makes for them.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}})()`;

/** Reads what the pre-paint script already put on the element. */
export function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* Private mode and the like — the theme still applies for this session. */
  }
}
