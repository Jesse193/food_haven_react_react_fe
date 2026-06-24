import { useState } from 'react'
import './App.css'
import Overlay from './components/Overlay'
import Footer from './components/Footer'
import { Outlet } from 'react-router-dom'
import CookieConsent from './components/CookieConsent';

function App() {
  return (
    <>
      <div className="site-wrapper">
        <main className="site-content">
          <Outlet />
        </main>

        <Footer />
      </div>

      <CookieConsent />
    </>
  )
}

export default App
