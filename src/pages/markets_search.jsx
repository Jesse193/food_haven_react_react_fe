import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCoordinates } from '../services/coordinatesService'
import '../assets/stylesheets/markets_search.css'

function MarketsSearch() {
  const [addressLine1, setAddressLine1] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [searchRadius, setSearchRadius] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const buildAddress = () => {
    return [addressLine1, city, state, zipCode]
      .filter(Boolean)
      .join(', ')
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setError(null)

    const address = buildAddress()
    if (!address) {
      setError('Please enter an address to search.')
      return
    }

    try {
      const { latitude, longitude } = await getCoordinates(address)

      const params = new URLSearchParams({
        latitude,
        longitude,
        radius: searchRadius || '10',
      })

      navigate(`/markets/results?${params.toString()}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="markets-search">
      <h2>Search for Farmers Markets nearby</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          id="addressLine1"
          placeholder="Address Line 1"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
        />
        <input
          type="text"
          id="city"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          type="text"
          id="state"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
        <input
          type="text"
          id="zipCode"
          placeholder="Zip Code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
        />
        <input
          type="number"
          id="searchRadius"
          placeholder="Search Radius (miles)"
          value={searchRadius}
          onChange={(e) => setSearchRadius(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default MarketsSearch
