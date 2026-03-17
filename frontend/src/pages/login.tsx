import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import Header from '../components/header.tsx'
import Footer from '../components/footer.tsx'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <div className='app'>
      <Header />
      <Footer />
    </div>
  </React.StrictMode>
)
