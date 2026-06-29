import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '../assets/stylesheets/index.css'
import App from './App.jsx'
import Login from './login.jsx'
import Privacy from './privacy.jsx'
import MarketsSearch from './markets_search.jsx'
import MarketsResults from './markets_results.jsx'
import Directions from './directions.jsx'
import Favorites from './favorites.jsx'
import MarketDetail from './MarketDetail.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Login />} />
          <Route path="privacy-policy" element={<Privacy />} />
          <Route path="markets" element={<MarketsSearch />} />
          <Route path="markets/results" element={<MarketsResults />} />
          <Route path="directions" element={<Directions />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="markets/:id" element={<MarketDetail/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
