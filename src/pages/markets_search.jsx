import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCoordinates } from '../services/coordinatesService'
import '../assets/stylesheets/markets_search.css'

function MarketsSearch() {
  const [nearbyForm, setNearbyForm] = useState({
    addressLine1: '', city: '', state: '', zipCode: '', searchRadius: ''
  })

  const [addressForm, setAddressForm] = useState({
    addressLine1: '', city: '', state: '', zipCode: ''
  })

  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleNearbyChange = (e) => {
    setNearbyForm(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleAddressChange = (e) => {
    setAddressForm(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const buildAddress = (form) => {
    return [form.addressLine1, form.city, form.state, form.zipCode]
      .filter(Boolean)
      .join(', ')
  }

  const handleSearchNearby = async (e) => {
    e.preventDefault()
    const address = buildAddress(nearbyForm)
    if (!address) { setError('Please enter an address to search.'); return }
    try {
      const { latitude, longitude } = await getCoordinates(address)
      const params = new URLSearchParams({ latitude, longitude, radius: nearbyForm.searchRadius || '10' })
      navigate(`/markets/results?${params.toString()}`)
    } catch (err) { setError(err.message) }
  }

  const handleSearchAddress = async (e) => {
    e.preventDefault()
    const address = buildAddress(addressForm)
    if (!address) { setError('Please enter an address to search.'); return }
    try {
      const params = new URLSearchParams({
        addressLine1: addressForm.addressLine1,
        city: addressForm.city,
        state: addressForm.state,
        zipCode: addressForm.zipCode,
      })
      navigate(`/markets/results?${params.toString()}`)
    } catch (err) { setError(err.message) }
  }

  const handleSearchName = async (e) => {
    e.preventDefault()
    setError(null)
    if (!name) { setError('Please enter a market name to search'); return }
    try {
      const params = new URLSearchParams({ name })
      navigate(`/markets/results?${params.toString()}`)
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="markets-search">
      <h2>Search for Farmers Markets Nearby</h2>
      <form onSubmit={handleSearchNearby}>
        <input
          type="text"
          id="addressLine1"
          placeholder="Address Line 1"
          value={nearbyForm.addressLine1}
          onChange={handleNearbyChange}
        />
        <input
          type="text"
          id="city"
          placeholder="City"
          value={nearbyForm.city}
          onChange={handleNearbyChange}
        />
        <input
          type="text"
          id="state"
          placeholder="State"
          value={nearbyForm.state}
          onChange={handleNearbyChange}
        />
        <input
          type="text"
          id="zipCode"
          placeholder="Zip Code"
          value={nearbyForm.zipCode}
          onChange={handleNearbyChange}
        />
        <input
          type="number"
          id="searchRadius"
          placeholder="Search Radius (miles)"
          value={nearbyForm.searchRadius}
          onChange={handleNearbyChange}
        />
        <button type="submit">Search</button>
      </form>

      <h3>OR</h3>

      <h2>Search by a Farmers Market's Address</h2>
      <form onSubmit={handleSearchAddress}>
        <input
          type="text"
          id="addressLine1"
          placeholder="Address Line 1"
          value={addressForm.addressLine1}
          onChange={handleAddressChange}
        />
        <input
          type="text"
          id="city"
          placeholder="City"
          value={addressForm.city}
          onChange={handleAddressChange}
        />
        <input
          type="text"
          id="state"
          placeholder="State"
          value={addressForm.state}
          onChange={handleAddressChange}
        />
        <input
          type="text"
          id="zipCode"
          placeholder="Zip Code"
          value={addressForm.zipCode}
          onChange={handleAddressChange}
        />
        <button type="submit">Search</button>
      </form>

      <h3>OR</h3>

      <h2>Search by a Farmers Market's Name</h2>
      <form onSubmit={handleSearchName}>
        <input
          type="text"
          id="name"
          placeholder="Farmers Market's Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default MarketsSearch