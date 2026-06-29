import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { marketService } from '../services/marketsService'
import { favoritesService } from '../services/favoritesService'
import { parseMarketData } from '../services/marketParser'
import '../assets/stylesheets/markets_search.css'

function MarketsResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [myFavoritesList, setMyFavoritesList] = useState([])

  const originLatitude = searchParams.get('latitude')
  const originLongitude = searchParams.get('longitude')

  useEffect(() => {
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const radius = searchParams.get('radius') || '10'

    if (!latitude || !longitude) {
      setError('No coordinates were provided. Please run a search first.')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [marketData, favoritesData] = await Promise.all([
          marketService.searchMarkets({ latitude, longitude, radius }),
          favoritesService.getFavorites ? favoritesService.getFavorites() : Promise.resolve([])
        ])
        setResults(marketData)
        setMyFavoritesList(favoritesData || [])
      } catch (fetchError) {
        console.error('Error loading market results:', fetchError)
        setError(fetchError.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  return (
    <div className="markets-results">
      <div className="results-header">
        <button type="button" onClick={() => navigate('/markets')}>
          Back to Search
        </button>
        <h2>Market Search Results</h2>
      </div>

      {loading && <div className="loading-message">Loading results...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && results.length === 0 && (
        <div className="empty-message">No markets found for this search.</div>
      )}

      {!loading && results.length > 0 && (
        <div className="search-results">
          <ul>
            {results.map((market, index) => {
              const {
                marketId,
                name,
                addressText,
                trailingDetailsText,
                locationDetailSegments,
                rawLocationDetails,
                siteValue,
                isSiteUrl,
                descriptionText,
                hasMarketCoordinates,
                destLat,
                destLon,
                acceptedPayments,
                snapOptionItems,
                fnapItems
              } = parseMarketData(market)

              const directionsButton = hasMarketCoordinates ? (
                <button
                  type="button"
                  className="market-directions-button"
                  onClick={() => {
                    const params = new URLSearchParams({
                      startLat: originLatitude,
                      startLon: originLongitude,
                      destLat: String(destLat),
                      destLon: String(destLon),
                      destName: name,
                    })
                    navigate(`/directions?${params.toString()}`)
                  }}
                >
                  Get directions
                </button>
              ) : null

              const isFavorite = myFavoritesList.includes(marketId)

              const handleAddFavorite = async () => {
                try {
                  await favoritesService.addFavorite(marketId)
                  setMyFavoritesList((prev) => [...prev, marketId])
                  alert(`Added ${name} to favorites!`)
                } catch (addError) {
                  console.error('Error adding to favorites:', addError)
                  alert(`Failed to add ${name} to favorites: ${addError.message}`)
                }
              }

              const handleRemoveFavorite = async () => {
                try {
                  await favoritesService.removeFavorite(marketId)
                  setMyFavoritesList((prev) => prev.filter((id) => id !== marketId))
                  alert(`Removed ${name} from favorites!`)
                } catch (removeError) {
                  console.error('Error removing from favorites:', removeError)
                  alert(`Failed to remove ${name} from favorites: ${removeError.message}`)
                }
              }

              const renderLocationDetails = locationDetailSegments.length > 0 ? (
                <div className="market-location-details">
                  <div className="market-location-label"><strong>Location Details:</strong></div>
                  {locationDetailSegments.map((line, idx) => {
                    const urlMatch = line.match(/https?:\/\/\S+|www\.\S+/i)
                    const sanitizedLine = line.replace(/;+$|;+\s*$/g, '').trim()
                    if (!urlMatch) return <div key={idx}>{sanitizedLine}</div>
                    
                    const url = urlMatch[0]
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

              const renderRawLocationDetails = rawLocationDetails ? (
                <div className="market-raw-location-details">Raw Location Details: {rawLocationDetails}</div>
              ) : null

              const siteText = isSiteUrl ? (
                <div>
                  Website:{' '}
                  <a href={siteValue.startsWith('http') ? siteValue : `https://${siteValue}`} target="_blank" rel="noreferrer noopener">
                    {siteValue}
                  </a>
                </div>
              ) : null

              const acceptedPaymentText = acceptedPayments.length > 0 ? (
                <div className="market-accepted-payment">
                  <strong>Accepted Payment: </strong>{acceptedPayments.join(', ')}
                </div>
              ) : <div className="market-accepted-payment">Accepted Payment: Unavailable</div>

              const snapOptionText = (
                <div className="market-snap-badge">
                  <strong>SNAP Option:</strong> {snapOptionItems.length > 0 ? snapOptionItems.join(', ') : 'Unavailable'}
                </div>
              )

              const fnapText = fnapItems.length > 0 ? (
                <div><strong>SNAP Details: </strong>{fnapItems.join(', ')}</div>
              ) : null

              return (
                <li key={marketId || name || index} className="market-result-item">
                  <div className="market-result-name">
                    <strong>{name}</strong>
                  </div>
                  <div className="market-result-address" style={{ display: 'block', marginBottom: '6px' }}>
                    <strong>{addressText}</strong>
                  </div>
                  {trailingDetailsText && (
                    <div className="market-extracted-details" style={{ display: 'block', marginBottom: '6px', color: '#555' }}>
                      {trailingDetailsText}
                    </div>
                  )}
                  {renderLocationDetails && <div style={{ display: 'block', marginBottom: '4px' }}>{renderLocationDetails}</div>}
                  {renderRawLocationDetails && <div style={{ display: 'block', marginBottom: '4px' }}>{renderRawLocationDetails}</div>}
                  <div className="market-snap-section" style={{ display: 'block', marginBottom: '4px' }}>
                    {snapOptionText}
                  </div>
                  {fnapText && <div style={{ display: 'block', marginBottom: '4px' }}>{fnapText}</div>}
                  {siteText && <div style={{ display: 'block', marginBottom: '4px' }}>{siteText}</div>}
                  {descriptionText && <div style={{ display: 'block', marginBottom: '4px' }}>{descriptionText}</div>}
                  <div className="market-payment-section" style={{ display: 'block', marginBottom: '12px' }}>
                    {acceptedPaymentText}
                  </div>
                  <div className="market-result-buttons">
                    {directionsButton}
                    {isFavorite ? (
                      <button type="button" className="market-remove-favorite-button" onClick={handleRemoveFavorite}>
                        Remove from Favorites
                      </button>
                    ) : (
                      <button type="button" className="market-favorite-button" onClick={handleAddFavorite}>
                        Add to Favorites
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default MarketsResults
