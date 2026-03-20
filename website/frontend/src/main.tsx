import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import Header from './components/header.tsx'
import Footer from './components/footer.tsx'
import LoginPage from './pages/login.tsx'
import RegisterPage from './pages/register'
import ProfilePage from './pages/profile'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
        <ProfilePage/>
  </React.StrictMode>
)
