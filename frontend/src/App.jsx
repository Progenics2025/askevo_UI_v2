import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import LoginPage from './LoginPage'
import Dashboard from './Dashboard'
import NFCLogin from './NFCLogin'
import { migrateOllamaUrl } from './lib/migrateOllamaUrl'
import './App.css'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  // Restore authentication state on mount
  useEffect(() => {
    // Migrate Ollama URL from HTTP to HTTPS
    migrateOllamaUrl();

    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse saved user:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogin = (email) => {
    const userData = { email, name: email.split('@')[0] }
    setIsAuthenticated(true)
    setUser(userData)
    // Persist to localStorage
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    // Clear from localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/nfc-login" element={<NFCLogin />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
