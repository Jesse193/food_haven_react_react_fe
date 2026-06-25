import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCoordinates } from './services/coordinatesService'
import './markets_search.css'

function MarketsSearch() {
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [searchRadius, setSearchRadius] = useState('10')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const buildAddress = () => {
    return [addressLine1, addressLine2, city, state, zipCode]
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
      <form onSubmit={handleSearch}>
        <label htmlFor="addressLine1">Address Line 1:</label>
        <input
          type="text"
          id="addressLine1"
          placeholder="Address Line 1"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
        />
        <label htmlFor="addressLine2">Address Line 2:</label>
        <input
          type="text"
          id="addressLine2"
          placeholder="Address Line 2"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
        />
        <label htmlFor="city">City:</label>
        <input
          type="text"
          id="city"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <label htmlFor="state">State:</label>
        <input
          type="text"
          id="state"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
        <label htmlFor="zipCode">Zip Code:</label>
        <input
          type="text"
          id="zipCode"
          placeholder="Zip Code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
        />
        <label htmlFor="searchRadius">Search Radius (miles):</label>
        <input
          type="number"
          id="searchRadius"
          placeholder="Search Radius"
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
