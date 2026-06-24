import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { marketService } from './services/marketsService'
import './markets_search.css'

function MarketsResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const radius = searchParams.get('radius') || '10'

    if (!latitude || !longitude) {
      setError('No coordinates were provided. Please run a search first.')
      return
    }

    const fetchResults = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await marketService.searchMarkets({
          latitude,
          longitude,
          radius,
        })

        setResults(data)
      } catch (fetchError) {
        console.error('Error loading market results:', fetchError)
        setError(fetchError.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams])

  return (
    <div className="markets-results">
      <div className="results-header">
        <h2>Market Search Results</h2>
        <button type="button" onClick={() => navigate('/markets')}>
          Back to Search
        </button>
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
              const normalizedMarket = market.attributes ? { id: market.id, ...market.attributes } : market
              const name = normalizedMarket.name || 'Market'
              const addressText = normalizedMarket.address || 'Address unavailable'
              const siteValue = normalizedMarket.site || normalizedMarket.url || ''
              const isSiteUrl = /^(https?:\/\/|www\.)/i.test(siteValue)
              const descriptionValue = normalizedMarket.description || ''
              const rawLocationDetails =
                normalizedMarket.location_details || normalizedMarket.locationDetails || normalizedMarket.location || ''
              const locationLikeDescription = descriptionValue.trim()
              const locationHintRegex = /\b(parking lot|located at|church|metro station|street|road|lane|parking|corner|between|grounds|plaza|square|avenue|highway|route|rt|blvd|place|court|walkway)\b/i
              const descriptionLooksLikeLocation = locationLikeDescription
                ? locationHintRegex.test(locationLikeDescription) && !/(SNAP|EBT|Credit|Debit|Payment|Website|SNAP Option|SNAP Details|Accepted Payment)/i.test(locationLikeDescription)
                : false
              const mergedLocationDetails = [rawLocationDetails, descriptionLooksLikeLocation ? locationLikeDescription : '']
                .filter(Boolean)
                .join(' ; ')
              const cleanedLocationDetails = mergedLocationDetails
                .replace(/_x000d_/gi, ' ')
                .replace(/\r?\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()

              const sanitizeSegment = (item) => item.replace(/;+$|;+\s*$/g, '').trim()
              const splitBySemicolon = (text) =>
                text
                  .split(/\s*;\s*/)
                  .map((item) => sanitizeSegment(item))
                  .filter(Boolean)

              const labelValueRegex = /(Location Details|SNAP Option|SNAP Details|Accepted Payment|Website):/gi
              const labels = {}
              let prefixText = ''

              if (cleanedLocationDetails) {
                const matches = [...cleanedLocationDetails.matchAll(labelValueRegex)]
                if (matches.length > 0) {
                  const labelStarts = matches.map((match) => ({ key: match[1].toLowerCase(), index: match.index }))
                  if (labelStarts[0].index > 0) {
                    prefixText = cleanedLocationDetails.slice(0, labelStarts[0].index).trim()
                  }

                  labelStarts.forEach((item, idx) => {
                    const start = item.index + item.key.length + 1
                    const end = idx + 1 < labelStarts.length ? labelStarts[idx + 1].index : cleanedLocationDetails.length
                    labels[item.key] = cleanedLocationDetails.slice(start, end).trim()
                  })
                } else {
                  prefixText = cleanedLocationDetails
                }
              }

              const locationDetailSegments = []
              if (prefixText) {
                locationDetailSegments.push(...splitBySemicolon(prefixText))
              }
              if (labels['location details']) {
                locationDetailSegments.push(...splitBySemicolon(labels['location details']))
              }

              const trailingLocationMatcher = /(Parking lot|Located at|Church of|Church|Grounds|grounds|across from|behind|near)/i
              const extractTrailingLocation = (labelKey) => {
                const labelValue = labels[labelKey]
                if (!labelValue) return

                const extraMatch = labelValue.match(trailingLocationMatcher)
                if (!extraMatch) return

                const splitIndex = labelValue.toLowerCase().indexOf(extraMatch[0].toLowerCase())
                const extraLocation = labelValue.slice(splitIndex).trim()
                const labelContent = labelValue.slice(0, splitIndex).trim()
                if (extraLocation) locationDetailSegments.push(...splitBySemicolon(extraLocation))
                labels[labelKey] = labelContent
              }

              extractTrailingLocation('snap details')
              extractTrailingLocation('accepted payment')

              if (locationDetailSegments.length === 0 && cleanedLocationDetails) {
                const fallbackMatch = cleanedLocationDetails.match(trailingLocationMatcher)
                if (fallbackMatch) {
                  const fallbackIndex = cleanedLocationDetails.toLowerCase().indexOf(fallbackMatch[0].toLowerCase())
                  locationDetailSegments.push(cleanedLocationDetails.slice(fallbackIndex).trim())
                }
              }

              if (!isSiteUrl && siteValue && !locationDetailSegments.some((segment) => segment === siteValue.trim())) {
                locationDetailSegments.push(siteValue.trim())
              }

              const renderLocationDetails = locationDetailSegments.length > 0 ? (
                <div className="market-location-details">
                  <div className="market-location-label">Location Details:</div>
                  {locationDetailSegments.map((line, idx) => {
                    const urlMatch = line.match(/https?:\/\/\S+|www\.\S+/i)
                    const sanitizedLine = line.replace(/;+$|;+\s*$/g, '').trim()
                    if (!urlMatch) {
                      return <div key={idx}>{sanitizedLine}</div>
                    }

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
              const descriptionText = !descriptionLooksLikeLocation && normalizedMarket.description ? <div>{normalizedMarket.description}</div> : null
              const acceptedPaymentValue = normalizedMarket.accepted_payment || normalizedMarket.acceptedPayment || ''
              const acceptedPayments = acceptedPaymentValue
                .split(/\s*;\s*/)
                .map((payment) => payment.trim())
                .filter(Boolean)
              const acceptedPaymentText = acceptedPayments.length > 0 ? (
                <div className="market-accepted-payment">
                  Accepted Payment: {acceptedPayments.join(', ')}
                </div>
              ) : <div className="market-accepted-payment">Accepted Payment: Unavailable</div>
              const snapOptionValue = normalizedMarket.snap_option || normalizedMarket.snapOption || ''
              const snapOptionItems = snapOptionValue
                .split(/\s*;\s*/)
                .map((item) => item.trim())
                .filter(Boolean)
              const snapOptionText = (
                <div className="market-snap-badge">
                  SNAP Option: {snapOptionItems.length > 0 ? snapOptionItems.join(', ') : 'Unavailable'}
                </div>
              )
              const fnapValue =
                normalizedMarket.fnap || normalizedMarket.fnap_option || normalizedMarket.fnapOption || ''
              const fnapItems = fnapValue
                .split(/\s*;\s*/)
                .map((item) => item.trim())
                .filter(Boolean)
              const fnapText = fnapItems.length > 0 ? (
                <div>SNAP Details: {fnapItems.join(', ')}</div>
              ) : null

              return (
                <li key={normalizedMarket.id || normalizedMarket.market_id || name || index} className="market-result-item">
                  <div className="market-result-name">
                    <strong>{name}</strong>
                  </div>
                  <div className="market-result-address">{addressText}</div>
                  {renderLocationDetails}
                  <br></br>
                  {renderRawLocationDetails}
                  <br></br>
                  {snapOptionText}
                  <br></br>
                  {fnapText}
                  <br></br>
                  {siteText}
                  <br></br>
                  {descriptionText}
                  <br></br>
                  {acceptedPaymentText}
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
