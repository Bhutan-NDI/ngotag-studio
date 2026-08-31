/**
 * Ngotag ("Bhutan NDI") theme fonts — Host Grotesk / Inter / DM Mono, ported
 * from the BhutanNDI_Studio reference (`src/app/layout.tsx` there).
 *
 * These are intentionally NOT registered under the shared `--font-sans` /
 * `--font-mono` custom properties that `src/lib/font.ts` already defines
 * (DM Sans / Sora / JetBrains Mono, applied to <body> for every theme): a
 * next/font `variable` declaration on an element wins over any same-named
 * `:root`-level declaration in a theme CSS file, so reusing those names here
 * would silently fight the existing global body font instead of layering on
 * top of it. Using distinct property names lets both live side by side —
 * the shared fonts remain the default for anything not yet reskinned, and
 * these apply only where `getActiveTheme() === 'ngotag'` adds the class
 * variables below to <body> (see `src/app/layout.tsx`) and a ngotag
 * component opts in via the `font-display` / `font-ngotag-body` /
 * `font-ngotag-mono` Tailwind utilities (bridged in `src/app/globals.css`).
 */
import { DM_Mono, Host_Grotesk, Inter } from 'next/font/google'

const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  variable: '--font-ngotag-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ngotag-body',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ngotag-mono',
  display: 'swap',
})

export const ngotagFontVariables = `${hostGrotesk.variable} ${inter.variable} ${dmMono.variable}`
