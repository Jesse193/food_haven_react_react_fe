import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { marketService } from '../services/marketsService'
import { parseMarketData } from '../services/marketParser'
import { getCoordinates } from '../services/coordinatesService'

function MarketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [market, setMarket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [showDirectionsModal, setShowDirectionsModal] = useState(false)
  const [geocodingLoading, setGeocodingLoading] = useState(false)
  const [directionsError, setDirectionsError] = useState(null)
  
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const data = await marketService.getMarket(id)
        setMarket(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMarket()
  }, [id])

  if (loading) return <p>Loading market...</p>
  if (error) return <p>Error: {error}</p>
  if (!market) return <p>Market not found.</p>

  const {
    name,
    addressText,
    trailingDetailsText,
    locationDetailSegments,
    rawLocationDetails,
    siteValue,
    isSiteUrl,
    descriptionText,
    destLat,
    destLon,
    acceptedPayments,
    snapOptionItems,
    fnapItems
  } = parseMarketData(market)

  const buildStartingAddress = () => {
    return [addressLine1, addressLine2, city, state, zipCode]
      .map(val => val.trim())
      .filter(Boolean)
      .join(', ')
  }

  const handleGetDirections = async (e) => {
    if (e) e.preventDefault()
    
    const combinedAddress = buildStartingAddress()
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
        destLat: destLat != null ? String(destLat) : '',
        destLon: destLon != null ? String(destLon) : '',
        destName: name,
      })
      
      setShowDirectionsModal(false)
      navigate(`/directions?${params.toString()}`)
    } catch (geoErr) {
      console.error('Geocoding error:', geoErr)
      setDirectionsError(geoErr.message || 'Failed to resolve starting address. Please verify your input.')
    } finally {
      setGeocodingLoading(false)
    }
  }

  const renderLocationDetails = locationDetailSegments.length > 0 ? (
    <div className="market-location-details">
      <div className="market-location-label"><strong>Location Details:</strong></div>
      {locationDetailSegments.map((line, idx) => {
        const urlMatch = line.match(/https?:\/\/\S+|www\.\S+/i)
        const sanitizedLine = line.replace(/;+$|;+\s*$/g, '').trim()
        if (!urlMatch) return <div key={idx}>{sanitizedLine}</div>
        
        const url = urlMatch
        const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
        const textBeforeUrl = sanitizedLine.replace(url, '').trim()
        return (
          <div key={idx}>
            {textBeforeUrl ? <span>{textBeforeUrl} </span> : null}
            <a href={normalizedUrl} target="_blank" rel="noreferrer noopener">
              {url}
            </a>
          </div>
        )
      })}
    </div>
  ) : null

  return (
    <div className="market-detail">
      <button className="back-button" type="button" onClick={() => navigate(-1)}>← Back</button>
      <h1>{name || `Market #${id}`}</h1>
      
      <p><strong>Address:</strong> {addressText}</p>
      
      {trailingDetailsText && (
        <p className="market-extracted-details" style={{ color: '#555' }}>
          {trailingDetailsText}
        </p>
      )}

      {renderLocationDetails}
      {rawLocationDetails && <p><strong>Raw Location Details:</strong> {rawLocationDetails}</p>}

      <p>
        <strong>SNAP Option:</strong> {snapOptionItems.length > 0 ? snapOptionItems.join(', ') : 'Unavailable'}
      </p>

      {fnapItems.length > 0 && (
        <p><strong>SNAP Details:</strong> {fnapItems.join(', ')}</p>
      )}

      <p>
        <strong>Accepted Payment:</strong> {acceptedPayments.length > 0 ? acceptedPayments.join(', ') : 'Unavailable'}
      </p>

      {isSiteUrl && (
        <p>
          <strong>Website:</strong>{' '}
          <a href={siteValue.startsWith('http') ? siteValue : `https://${siteValue}`} target="_blank" rel="noreferrer noopener">
            {siteValue}
          </a>
        </p>
      )}

      {descriptionText && <p>{descriptionText}</p>}

      <button 
        type="button" 
        className="market-directions-button" 
        onClick={() => {
          setShowDirectionsModal(true)
          setDirectionsError(null)
        }}
      >
        Get Directions
      </button>

      {showDirectionsModal && (
        <div className="commutes-modal-container show">
          <div className="commutes-modal" role="dialog" aria-modal="true" aria-labelledby="directions-modal-heading">
            <div className="content">
              <h2 id="directions-modal-heading" className="heading">
                Get Directions to {name}
              </h2>
              <h4>Enter your Starting Address</h4>
              <form onSubmit={handleGetDirections}>
                <input type="text" id="addressLine1" placeholder="Address Line 1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} disabled={geocodingLoading} />
                <input type="text" id="city" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} disabled={geocodingLoading} />
                <input type="text" id="state" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} disabled={geocodingLoading} />
                <input type="text" id="zipCode" placeholder="Zip Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} disabled={geocodingLoading} />
                
                {directionsError && (
                  <div className="error-message" role="alert">{directionsError}</div>
                )}
                
                <div className="modal-action-bar">
                  <button className="cancel-button" type="button" onClick={() => setShowDirectionsModal(false)} disabled={geocodingLoading}>
                    Cancel
                  </button>
                  <button className="add-destination-button" type="submit" disabled={geocodingLoading}>
                    {geocodingLoading ? 'Locating...' : 'Get Directions'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketDetail
