import { useState } from 'react'
import '../assets/stylesheets/App.css'
import Overlay from '../components/Overlay'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'
import CookieConsent from '../components/CookieConsent';
import { LoadScript } from '@react-google-maps/api'

function App() {
  return (
    <>
      <LoadScript
      googleMapsApiKey={import.meta.env.VITE_MAPS_API_KEY}
      libraries={["places"]}
      >
        <div className="site-wrapper">
          <Header />
          <main className="site-content">
            <Outlet />
          </main>

          <Footer />
        </div>

        <CookieConsent />
    </LoadScript>

    </>
  )
}

export default App
