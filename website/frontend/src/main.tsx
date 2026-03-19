import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import Header from './components/header.tsx'
import Footer from './components/footer.tsx'
import LoginPage from './pages/login.tsx'
import RegisterPage from './pages/register.tsx'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <div className='app'>
      <Header />
      <main className='content flex justify-center'>
        <RegisterPage />
      </main>
      <Footer />
    </div>
  </React.StrictMode>
)
