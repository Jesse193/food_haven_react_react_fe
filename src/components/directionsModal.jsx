import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCoordinates } from '../services/coordinatesService'
import '../assets/stylesheets/DirectionsModal.css'
import { useGeolocation } from '../services/geolocationService'

function DirectionsModal({ market, onClose }) {
  const { position, error: geoError, loading: geoLoading } = useGeolocation();
  const [useGPS, setUseGPS] = useState(false);
  const navigate = useNavigate()
  
  const [addressLine1, setAddressLine1] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [geocodingLoading, setGeocodingLoading] = useState(false)
  const [directionsError, setDirectionsError] = useState(null)

  const handleGetDirections = async (e) => {
    e.preventDefault()
    setDirectionsError(null)

    if (useGPS) {
      if (geoError) {
        setDirectionsError(`Location access denied: ${geoError}`)
        return
      }
      if (!position.latitude || !position.longitude) {
        setDirectionsError('Still detecting your current location. Please wait a moment.')
        return
      }

      const params = new URLSearchParams({
        startLat: String(position.latitude),
        startLon: String(position.longitude),
        destLat: String(market.destLat),
        destLon: String(market.destLon),
        destName: market.name,
      })
      onClose()
      navigate(`/directions?${params.toString()}`)
      return // Halt execution here
    }

    // --- CASE 2: Fetching directions using Manual Form Text ---
    const combinedAddress = [addressLine1, city, state, zipCode]
      .map(val => val.trim())
      .filter(Boolean)
      .join(', ')

    if (!combinedAddress) {
      setDirectionsError('Please enter a starting address.')
      return
    }

    setGeocodingLoading(true)
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
          
          <div className="toggle-container">
            <label className="switch-label">
              <input 
                type="checkbox" 
                className="switch-input" 
                checked={useGPS} 
                onChange={(e) => setUseGPS(e.target.checked)} 
              />
              <span className="switch-slider"></span>
            </label>
            <span className="toggle-text">Use My Current Location</span>
            {useGPS && geoLoading && <small className="loading-text">(Detecting GPS...)</small>}
          </div>

          <h4>Enter your Starting Address</h4>
          
          <form onSubmit={handleGetDirections}>
            <input type="text" placeholder="Address Line 1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} disabled={useGPS} />
            <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} disabled={useGPS} />
            <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} disabled={useGPS} />
            <input type="text" placeholder="Zip Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} disabled={useGPS} />

            {directionsError && (
              <div className="error-message" role="alert">{directionsError}</div>
            )}

            <div className="modal-action-bar">
              <button className="cancel-button" type="button" onClick={onClose}>
                Cancel
              </button>
              
              <button 
                className="add-destination-button" 
                type="submit" 
                disabled={(useGPS && geoLoading) || geocodingLoading}
              >
                {useGPS && geoLoading ? 'Waiting for GPS...' : geocodingLoading ? 'Geocoding...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DirectionsModal
