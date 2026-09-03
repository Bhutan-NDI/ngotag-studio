import {
  appFaviconPath,
  bhutanndiFaviconPath,
  credeblFaviconPath,
  sovioFaviconPath,
} from '@/config/CommonConstant'

/**
 * Build-time theme gate for the Bhutanndi ("Bhutan NDI") reskin.
 *
 * This app is a single shared source tree built into four white-labelled
 * deployments (Phenix, CREDEBL, SOVIO, Bhutanndi) that differ only by which
 * `public/themes/<name>_theme.css` file is dynamically loaded at runtime
 * (see `src/components/active-theme.tsx`) and which `NEXT_PUBLIC_*` env
 * vars a given deployment's CI pipeline bakes in at build time.
 *
 * `getActiveTheme()` is the single source of truth new Bhutanndi-specific
 * components/pages should check before rendering their reskinned
 * presentation instead of the shared/generic one, e.g.:
 *
 *   if (getActiveTheme() === 'bhutanndi') {
 *     return <BhutanndiDashboardView ... />
 *   }
 *   return <ExistingDashboardView ... />
 *
 * NEXT_PUBLIC_ vars are inlined by Next.js at build time and are available
 * identically in server components, client components, and route handlers.
 * Each real deployment only ever ships one theme, so a build-time check is
 * the correct granularity for gating an entire reskinned component tree.
 */
export const DEFAULT_THEME = 'bhutanndi' // DEFAULT THEME is "bhutanndi" for Now, but can be overridden by NEXT_PUBLIC_ACTIVE_THEME in .env.

/** Resolves the active theme name purely from NEXT_PUBLIC_ACTIVE_THEME, falling back to DEFAULT_THEME. */
export function getActiveTheme(): string {
  return (
    process.env.NEXT_PUBLIC_ACTIVE_THEME?.toLowerCase().trim() || DEFAULT_THEME
  )
}

export function isBhutanndiTheme(): boolean {
  return getActiveTheme() === 'bhutanndi'
}

const FAVICON_BY_THEME: Record<string, string> = {
  bhutanndi: bhutanndiFaviconPath,
  credebl: credeblFaviconPath,
  sovio: sovioFaviconPath,
}

/** Resolves the browser tab / loading-screen mark for the active theme, falling back to the Phenix default. */
export function getActiveFaviconPath(): string {
  return FAVICON_BY_THEME[getActiveTheme()] ?? appFaviconPath
}
