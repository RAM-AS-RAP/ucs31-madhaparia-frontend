import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import AuthContext from './AuthContextBase'

import {
  AUTH_EXPIRED_EVENT,
  clearAuthToken,
  getAuthToken,
  getCurrentUser,
  loginPatient,
  saveAuthToken,
} from '../services/auth'

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    async function restoreSession() {
      const token = getAuthToken()

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const currentUser =
          await getCurrentUser()

        setUser(currentUser)
      } catch {
        clearAuthToken()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  useEffect(() => {
    function handleExpiredSession() {
      setUser(null)
      setLoading(false)
    }

    window.addEventListener(
      AUTH_EXPIRED_EVENT,
      handleExpiredSession,
    )

    return () => {
      window.removeEventListener(
        AUTH_EXPIRED_EVENT,
        handleExpiredSession,
      )
    }
  }, [])

  async function login(
    email,
    password,
  ) {
    const loginData =
      await loginPatient(
        email,
        password,
      )

    saveAuthToken(
      loginData.access_token,
    )

    try {
      const currentUser =
        await getCurrentUser()

      setUser(currentUser)

      return currentUser
    } catch (error) {
      clearAuthToken()
      setUser(null)

      throw error
    }
  }

  function logout() {
    clearAuthToken()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated:
        Boolean(user),
      isAdmin:
        user?.role === 'admin',
    }),
    [user, loading],
  )

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}