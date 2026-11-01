
const PATIENT_ROUTES = new Set([
  '/dashboard',
  '/symptoms',
  '/symptoms/confirm',
  '/prediction',
  '/history',
])

export function getRoleHomePath(role) {
  if (role === 'admin') return '/admin'
  if (role === 'patient') return '/dashboard'

  return '/access-denied'
}

export function resolvePostLoginPath(role, requestedPath) {
  const fallback = getRoleHomePath(role)

  if (
    typeof requestedPath !== 'string' ||
    !requestedPath.startsWith('/') ||
    requestedPath.startsWith('//') ||
    requestedPath.includes('\\')
  ) {
    return fallback
  }

  if (role === 'patient') {
    const allowed =
      PATIENT_ROUTES.has(requestedPath) ||
      /^\/history\/[^/?#]+$/.test(requestedPath)

    return allowed ? requestedPath : fallback
  }

  if (role === 'admin') {
    const allowed =
      requestedPath === '/admin' ||
      /^\/admin\/history\/[^/?#]+$/.test(requestedPath)

    return allowed ? requestedPath : fallback
  }

  return fallback
}
