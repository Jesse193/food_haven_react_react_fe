import { useState } from 'react'
import '../assets/stylesheets/App.css'
import Overlay from '../components/Overlay'
import Footer from '../components/Footer'
import Header from '../components/header'
import { Outlet } from 'react-router-dom'
import CookieConsent from '../components/CookieConsent';

function App() {
  return (
    <>
      <div className="site-wrapper">
        <Header />
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
