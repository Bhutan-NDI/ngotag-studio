import { Lockup } from "./Lockup";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The header on the signed-out pages: the lockup alone, sitting on the page
 * ground at the top-left corner.
 *
 * It carries no fill, no hairline and no sticky position, unlike the signed-in
 * top bar. That bar earns its surface — it spans a sidebar, holds the org
 * selector and account controls, and content scrolls under it. Here there is
 * only a logo, so a translucent slab across the top just laid a second, darker
 * band over the atmosphere and read as a strip bolted onto the page.
 *
 * The gutters match the app's top bar rather than the auth column's 1200px
 * measure, so the logo lands in the same place whether you are signed in or
 * out. Aligning it to the form column instead would have floated it into the
 * middle of a wide screen.
 */
export function AuthHeader() {
  return (
    <header className="relative z-[60]">
      <div className="flex h-16 w-full items-center px-4 min-[641px]:px-6">
        <Lockup className="block h-7 w-auto min-[641px]:h-8" />
        {/* Signed out is where someone first meets the product, so the choice
            of theme has to be reachable before there is an account to hang it
            on. Same control as the top bar, same stored preference. */}
        <span className="ml-auto">
          <ThemeToggle />
        </span>
      </div>
    </header>
  );
}
