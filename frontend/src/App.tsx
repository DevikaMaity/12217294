import { useState, useEffect } from 'react'
import './App.css'
import AuthForm from './components/AuthForm'
import Navbar from './components/Navbar'
import UrlShortener from './components/UrlShortener'
import UrlList from './components/UrlList'

interface Url {
  _id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  expiry: string;
  validity: number;
  isCustomShortcode: boolean;
  isExpired: boolean;
}
interface User {
  id: string;
  email: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

function App() {
  const [urls, setUrls] = useState<Url[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    if (user && token) {
      fetchUrls()
    }
  }, [user, token])

  const fetchUrls = async () => {
    if (!token) return
    
    try {
      const response = await fetch(`${process?.env.BACKEND_URL}/api/urls`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if(response.status === 401){
        handleLogout()
        throw new Error('Unauthorized')
      }
      const data = await response.json()
      setUrls(data)
    } catch (error) {
      console.log('Error fetching URLs:', error)
    }
  }

  const handleAuth = async (email: string, password: string, mode: 'login' | 'register') => {
    setIsLoading(true)
    setAuthError('')

    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/auth/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        const authData = data as AuthResponse
        setUser(authData.user)
        setToken(authData.token)
        localStorage.setItem('token', authData.token)
        localStorage.setItem('user', JSON.stringify(authData.user))
      } else {
        setAuthError(data.error || 'Authentication failed')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setAuthError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    setUrls([])
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (!user) {
    return <AuthForm onAuth={handleAuth} isLoading={isLoading} error={authError} />
  }

  return (
    <div className="app">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="main-content">
        <div className="container">
          <UrlShortener 
            onUrlShortened={fetchUrls}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            token={token!}
          />          
          <UrlList urls={urls} />
        </div>
      </div>
    </div>
  )
}

export default App
