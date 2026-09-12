import { createContext, useContext, useEffect, useState } from 'react'

import api from '../services/api'

const AuthContext = createContext(null)

// The token is stored in localStorage for this mini project.
// The axios interceptor (services/api.js) attaches it automatically.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // On app start, try to restore the session from a stored token
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('authToken')

      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        setToken(storedToken)
        const res = await api.get('/auth/me')
        setUser(res.data)
      } catch {
        // Token is invalid or expired - clear it so the user must log in again
        localStorage.removeItem('authToken')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('authToken', res.data.token)
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (name, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword,
    })
    localStorage.setItem('authToken', res.data.token)
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
  }

  const value = { user, token, loading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return context
}