
import { describe, expect, it } from 'vitest'

import {
  getRoleHomePath,
  resolvePostLoginPath,
} from '../roleRouting'

describe('role-based home routes', () => {
  it('sends patients to their dashboard', () => {
    expect(getRoleHomePath('patient')).toBe('/dashboard')
  })

  it('sends administrators to their dashboard', () => {
    expect(getRoleHomePath('admin')).toBe('/admin')
  })

  it('rejects unsupported account roles', () => {
    expect(getRoleHomePath('unknown')).toBe('/access-denied')
    expect(getRoleHomePath(null)).toBe('/access-denied')
  })
})

describe('redirects after login', () => {
  it('restores an allowed patient route', () => {
    expect(resolvePostLoginPath('patient', '/history'))
      .toBe('/history')

    expect(resolvePostLoginPath('patient', '/symptoms/confirm'))
      .toBe('/symptoms/confirm')

    expect(resolvePostLoginPath('patient', '/history/abc-123'))
      .toBe('/history/abc-123')
  })

  it('prevents patients from entering administrator routes', () => {
    expect(resolvePostLoginPath('patient', '/admin'))
      .toBe('/dashboard')

    expect(resolvePostLoginPath('patient', '/admin/history/123'))
      .toBe('/dashboard')
  })

  it('restores an allowed administrator route', () => {
    expect(resolvePostLoginPath('admin', '/admin'))
      .toBe('/admin')

    expect(resolvePostLoginPath('admin', '/admin/history/123'))
      .toBe('/admin/history/123')
  })

  it('prevents administrators from entering patient routes', () => {
    expect(resolvePostLoginPath('admin', '/dashboard'))
      .toBe('/admin')

    expect(resolvePostLoginPath('admin', '/prediction'))
      .toBe('/admin')

    expect(resolvePostLoginPath('admin', '/history'))
      .toBe('/admin')
  })

  it('uses the correct dashboard when no path was requested', () => {
    expect(resolvePostLoginPath('patient', undefined))
      .toBe('/dashboard')

    expect(resolvePostLoginPath('admin', undefined))
      .toBe('/admin')
  })

  it('rejects external and invalid redirect paths', () => {
    const unsafePaths = [
      'https://example.com',
      '//example.com',
      '/admin\\history',
      '',
      null,
    ]

    for (const path of unsafePaths) {
      expect(resolvePostLoginPath('patient', path))
        .toBe('/dashboard')

      expect(resolvePostLoginPath('admin', path))
        .toBe('/admin')
    }
  })

  it('does not grant unknown roles patient or admin access', () => {
    expect(resolvePostLoginPath('unknown', '/dashboard'))
      .toBe('/access-denied')

    expect(resolvePostLoginPath('unknown', '/admin'))
      .toBe('/access-denied')
  })
})
