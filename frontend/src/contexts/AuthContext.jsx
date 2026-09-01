import { createContext, useState } from 'react'

const users = [
  { email: 'admin@food.com', password: '1234', role: 'admin' },
  { email: 'user@food.com', password: '1234', role: 'user' }
]

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password)
    if (found) {
      setUser(found)
    }
  }

  const register = (name, email, password) => {
    const exists = users.some(u => u.email === email)
    if (exists) return false
    users.push({ name, email, password, role: 'user' })
    setUser({ name, email, password, role: 'user' })
    return true
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}