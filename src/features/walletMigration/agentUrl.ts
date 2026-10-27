// The platform reaches this agent over the internet, so the address must be
// HTTPS with a public domain or IPv4 address. The URL parser also rejects
// impossible ports (above 65535).
const DOMAIN_NAME =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/
const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
const NON_PUBLIC_IPV4 = [
  /^0\./,
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
]

const parseUrl = (value?: string): URL | null => {
  try {
    return value ? new URL(value) : null
  } catch {
    return null
  }
}

export const isHttpsUrl = (value?: string): boolean => {
  const url = parseUrl(value)
  if (!url || url.protocol !== 'https:' || url.username || url.password) {
    return false
  }
  const ip = url.hostname.match(IPV4)
  if (ip) {
    return ip.slice(1).every((part) => Number(part) <= 255)
  }
  return url.hostname === 'localhost' || DOMAIN_NAME.test(url.hostname)
}

export const isPublicHost = (value?: string): boolean => {
  const url = parseUrl(value)
  if (!url) {
    return true // reported by the HTTPS check
  }
  const host = url.hostname
  if (host === 'localhost' || host.endsWith('.localhost')) {
    return false
  }
  return !(IPV4.test(host) && NON_PUBLIC_IPV4.some((range) => range.test(host)))
}

export const PUBLIC_HOST_MESSAGE =
  "Use a public address. Local and private network addresses can't be reached by our platform."
