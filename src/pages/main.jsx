import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '../assets/stylesheets/Index.css'
import App from './App.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import Privacy from './Privacy.jsx'
import MarketsSearch from './MarketsSearch.jsx'
import MarketsResults from './MarketsResults.jsx'
import Directions from './Directions.jsx'
import Favorites from './Favorites.jsx'
import MarketDetail from './MarketDetail.jsx'
import ForgotPassword from "./ForgotPassword.jsx";
import ResetPassword from "./ResetPassword.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Login />} />
          <Route path="register" element={<Register />}/>
          <Route path="privacy-policy" element={<Privacy />} />
          <Route path="markets" element={<MarketsSearch />} />
          <Route path="markets/results" element={<MarketsResults />} />
          <Route path="directions" element={<Directions />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="markets/:id" element={<MarketDetail/>} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
