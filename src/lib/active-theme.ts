import {
  appFaviconPath,
  credeblFaviconPath,
  ngotagFaviconPath,
  sovioFaviconPath,
} from '@/config/CommonConstant'

/**
 * Build-time theme gate for the Ngotag ("Bhutan NDI") reskin.
 *
 * This app is a single shared source tree built into four white-labelled
 * deployments (Phenix, CREDEBL, SOVIO, Ngotag) that differ only by which
 * `public/themes/<name>_theme.css` file is dynamically loaded at runtime
 * (see `src/components/active-theme.tsx`) and which `NEXT_PUBLIC_*` env
 * vars a given deployment's CI pipeline bakes in at build time.
 *
 * `getActiveTheme()` is the single source of truth new Ngotag-specific
 * components/pages should check before rendering their reskinned
 * presentation instead of the shared/generic one, e.g.:
 *
 *   if (getActiveTheme() === 'ngotag') {
 *     return <NgotagDashboardView ... />
 *   }
 *   return <ExistingDashboardView ... />
 *
 * NEXT_PUBLIC_ vars are inlined by Next.js at build time and are available
 * identically in server components, client components, and route handlers.
 * Each real deployment only ever ships one theme, so a build-time check is
 * the correct granularity for gating an entire reskinned component tree.
 */
export const DEFAULT_THEME = 'ngotag'

/** Resolves the active theme name purely from NEXT_PUBLIC_ACTIVE_THEME, falling back to DEFAULT_THEME. */
export function getActiveTheme(): string {
  return (
    process.env.NEXT_PUBLIC_ACTIVE_THEME?.toLowerCase().trim() || DEFAULT_THEME
  )
}

export function isNgotagTheme(): boolean {
  return getActiveTheme() === 'ngotag'
}

const FAVICON_BY_THEME: Record<string, string> = {
  ngotag: ngotagFaviconPath,
  credebl: credeblFaviconPath,
  sovio: sovioFaviconPath,
}

/** Resolves the browser tab / loading-screen mark for the active theme, falling back to the Phenix default. */
export function getActiveFaviconPath(): string {
  return FAVICON_BY_THEME[getActiveTheme()] ?? appFaviconPath
}
