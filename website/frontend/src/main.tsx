import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/login.tsx'
import RegisterPage from './pages/register'
import ProfilePage from './pages/profile'
import AboutPage from './pages/about'
import TermsPage from './pages/terms'
import EventsPage from './pages/events'
import FriendsPage from './pages/friends'
import SocialPage from './pages/social'
import WorkPage from './pages/work'
import MapPage from './pages/map'
import ContactPage from './pages/contact'
import AccountCustomizationPage from './pages/account'
import CustomerCustomizationPage from './pages/customer_per'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AboutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/account" element={<AccountCustomizationPage />}/>
        <Route path="/customer_per" element={<CustomerCustomizationPage />}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
