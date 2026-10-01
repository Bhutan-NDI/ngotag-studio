"use client";

import { Icon } from "@/components/ui/icons";
import { applyTheme, readTheme } from "@/lib/theme";

/**
 * The theme switch in the top bar.
 *
 * The icon names the action, not the state: in dark you see a sun, because
 * pressing it takes you to light. That is what the label has always said, so
 * showing the current phase instead left the two contradicting each other —
 * a sun beside "Switch to dark theme".
 *
 * Both faces render and CSS shows the right one, the same way Lockup picks its
 * cut. That settles it before first paint, where reading the stored theme in an
 * effect would render the dark face on a light page and correct it a frame
 * later. It also means the button holds no state: the theme lives on the root
 * element, so the click reads it from there and writes back the opposite.
 * `display: none` keeps the hidden face and its label out of the accessibility
 * tree, so exactly one label is announced.
 */
export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() => applyTheme(readTheme() === "dark" ? "light" : "dark")}
      className="ndi-navrow inline-flex h-10 w-10 items-center justify-center rounded-[10px]"
      data-active="0"
    >
      {/* The title sits on the face rather than the button so the tooltip
          matches whichever one is showing. */}
      <span className="on-dark-only inline-flex" title="Switch to light theme">
        <Icon name="sun" size={17} strokeWidth={1.7} />
        <span className="sr-only">Switch to light theme</span>
      </span>
      <span className="on-light-only inline-flex" title="Switch to dark theme">
        <Icon name="moon" size={17} strokeWidth={1.7} />
        <span className="sr-only">Switch to dark theme</span>
      </span>
    </button>
  );
}
