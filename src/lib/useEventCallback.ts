import { useCallback, useLayoutEffect, useRef } from 'react'

/**
 * A callback whose identity never changes but that always calls the latest
 * `fn`. Use it for handlers passed into memoised values such as table
 * columns: a new handler each render would rebuild them, and a rebuilt cell
 * remounts, losing keyboard focus inside it.
 */
export const useEventCallback = <Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
): ((...args: Args) => Result) => {
  const latest = useRef(fn)
  useLayoutEffect(() => {
    latest.current = fn
  })
  return useCallback((...args: Args) => latest.current(...args), [])
}
