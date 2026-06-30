import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCoordinates } from '../services/coordinatesService'
import '../assets/stylesheets/DirectionsModal.css'

function DirectionsModal({ market, onClose }) {
  const navigate = useNavigate()
  const [addressLine1, setAddressLine1] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [geocodingLoading, setGeocodingLoading] = useState(false)
  const [directionsError, setDirectionsError] = useState(null)

  const handleGetDirections = async (e) => {
    e.preventDefault()

    const combinedAddress = [addressLine1, city, state, zipCode]
      .map(val => val.trim())
      .filter(Boolean)
      .join(', ')

    if (!combinedAddress) {
      setDirectionsError('Please enter a starting address.')
      return
    }

    setGeocodingLoading(true)
    setDirectionsError(null)

    try {
      const coords = await getCoordinates(combinedAddress)
      const params = new URLSearchParams({
        startLat: String(coords.latitude),
        startLon: String(coords.longitude),
        destLat: String(market.destLat),
        destLon: String(market.destLon),
        destName: market.name,
      })
      onClose()
      navigate(`/directions?${params.toString()}`)
    } catch (geoErr) {
      setDirectionsError(geoErr.message || 'Failed to resolve starting address.')
    } finally {
      setGeocodingLoading(false)
    }
  }

  return (
    <div className="directions-modal-container show">
      <div className="directions-modal" role="dialog" aria-modal="true" aria-labelledby="directions-modal-heading">
        <div className="content">
          <h2 id="directions-modal-heading" className="heading">
            Get Directions to {market.name}
          </h2>
          <h4>Enter your Starting Address</h4>
          <form onSubmit={handleGetDirections}>
            <input
              type="text"
              placeholder="Address Line 1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              disabled={geocodingLoading}
            />
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={geocodingLoading}
            />
            <input
              type="text"
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={geocodingLoading}
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              disabled={geocodingLoading}
            />

            {directionsError && (
              <div className="error-message" role="alert">{directionsError}</div>
            )}

            <div className="modal-action-bar">
              <button
                className="cancel-button"
                type="button"
                onClick={onClose}
                disabled={geocodingLoading}
              >
                Cancel
              </button>
              <button
                className="add-destination-button"
                type="submit"
                disabled={geocodingLoading}
              >
                {geocodingLoading ? 'Locating...' : 'Get Directions'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DirectionsModal