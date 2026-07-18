import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import '../assets/stylesheets/Directions.css'

const Directions = () => {
  const [searchParams] = useSearchParams()
  const [travelMode, setTravelMode] = useState(null)
  const [selectedTravelMode, setSelectedTravelMode] = useState('DRIVING')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [routeError, setRouteError] = useState(null)
  const [modalError, setModalError] = useState(null)
  const [closeModalOnSuccess, setCloseModalOnSuccess] = useState(false)
  const originLat = parseNumber(searchParams.get('startLat') || searchParams.get('latitude'))
  const originLon = parseNumber(searchParams.get('startLon') || searchParams.get('longitude'))
  const destinationLat = parseNumber(searchParams.get('destLat') || searchParams.get('destinationLat'))
  const destinationLon = parseNumber(searchParams.get('destLon') || searchParams.get('destinationLon'))
  const destinationName = searchParams.get('destName') || ''
  const address = searchParams.get('address') || ''
  const mapsApiKey = import.meta.env.VITE_MAPS_API_KEY || ''
  const hasRoute = originLat != null && originLon != null && destinationLat != null && destinationLon != null
  const [directionsUrl, setDirectionsUrl] = useState('')

  function parseNumber(value) {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  useEffect(() => {
    if (!hasRoute || travelMode != null) return
    setIsModalOpen(true)
  }, [hasRoute, travelMode])

  useEffect(() => {
    if (!mapsApiKey || !hasRoute || !travelMode) return

    // Google's official dynamic-library-import bootstrap loader. This defines
    // `google.maps.importLibrary`, which google.maps.routes.Route.computeRoutes
    // requires. A plain <script src="..."> tag does not define importLibrary,
    // so this replaces the old loadScript helper. See:
    // https://developers.google.com/maps/documentation/javascript/load-maps-js-api
    const loadGoogleMapsBootstrap = (apiKey) => {
      if (window.google?.maps?.importLibrary) return

      ;((g) => {
        let h
        let a
        let k
        const p = 'The Google Maps JavaScript API'
        const c = 'google'
        const l = 'importLibrary'
        const q = '__ib__'
        const m = document
        let b = window
        b = b[c] || (b[c] = {})
        const d = b.maps || (b.maps = {})
        const r = new Set()
        const e = new URLSearchParams()
        const u = () =>
          h ||
          (h = new Promise(async (f, n) => {
            a = m.createElement('script')
            e.set('libraries', [...r] + '')
            for (k in g) e.set(k.replace(/[A-Z]/g, (t) => '_' + t[0].toLowerCase()), g[k])
            e.set('callback', c + '.maps.' + q)
            a.src = `https://maps.${c}apis.com/maps/api/js?` + e
            d[q] = f
            a.onerror = () => (h = n(Error(p + ' could not load.')))
            a.nonce = m.querySelector('script[nonce]')?.nonce || ''
            m.head.append(a)
          }))
        d[l]
          ? console.warn(p + ' only loads once. Ignoring:', g)
          : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)))
      })({ key: apiKey, v: 'weekly' })
    }

    const renderDirections = async () => {
      const mapView = document.querySelector('.map-view')
      const directionsPanel = document.getElementById('directions-panel')
      if (!mapView || !directionsPanel || !window.google?.maps) return

      const { Map } = await window.google.maps.importLibrary('maps')
      const { Route } = await window.google.maps.importLibrary('routes')

      const map = new Map(mapView, {
        center: { lat: originLat, lng: originLon },
        zoom: 14,
        // Advanced Markers (used below for pins) refuse to render without a
        // Map ID. DEMO_MAP_ID works for development; swap in your own Map ID
        // from Cloud Console > Google Maps Platform > Map Management for
        // production, since the demo ID has usage restrictions.
        mapId: import.meta.env.MAPS_MAP_ID || 'DEMO_MAP_ID',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend({ lat: originLat, lng: originLon })
      bounds.extend({ lat: destinationLat, lng: destinationLon })
      map.fitBounds(bounds)
      
      window.google.maps.event.addListenerOnce(map, 'idle', () => {
        const currentZoom = map.getZoom()
        const minDesiredZoom = 12
        const maxDesiredZoom = 16
        if (currentZoom < minDesiredZoom) map.setZoom(minDesiredZoom)
        if (currentZoom > maxDesiredZoom) map.setZoom(maxDesiredZoom)
      })

      try {
        const { routes } = await Route.computeRoutes({
          origin: { lat: originLat, lng: originLon },
          destination: { lat: destinationLat, lng: destinationLon },
          travelMode,
          fields: ['legs', 'path', 'durationMillis', 'distanceMeters'],
        })

        if (!routes || routes.length === 0) {
          const message =
            travelMode === 'TRANSIT'
              ? 'Public transport is not available for this route. Try a different travel mode.'
              : 'No route could be found for this travel mode.'
          setRouteError(message)
          setModalError(message)
          return
        }

        const route = routes[0]

        // Draw the route line on the map.
        route.createPolylines().forEach((polyline) => polyline.setMap(map))

        const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker')

        const createCustomMarker = (position, title, label) => {
          const content = document.createElement('div')
          content.style.display = 'flex'
          content.style.alignItems = 'center'
          content.style.justifyContent = 'center'
          content.style.width = '28px'
          content.style.height = '28px'
          content.style.borderRadius = '50%'
          content.style.backgroundColor = '#1f6feb'
          content.style.color = '#fff'
          content.style.fontSize = '13px'
          content.style.fontWeight = '700'
          content.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.25)'
          content.style.border = '2px solid #fff'
          content.textContent = label

          return new AdvancedMarkerElement({
            position,
            map,
            title,
            content,
          })
        }

        createCustomMarker({ lat: originLat, lng: originLon }, 'Start', 'S')
        createCustomMarker({ lat: destinationLat, lng: destinationLon }, destinationName || 'Destination', 'D')

        // Rebuild the turn-by-turn panel (imperative DOM, matching the
        // original code's direct DOM access pattern rather than adding
        // new React state). DirectionsRenderer used to generate and style
        // this HTML itself via setPanel(); Route only returns raw step
        // data, so the structure/spacing below is now ours to own.
        const formatDistance = (meters) => {
          if (meters == null) return ''
          if (meters >= 1000) {
            const km = meters / 1000
            return `${km.toFixed(km >= 10 ? 0 : 1)} km`
          }
          return `${Math.round(meters)} m`
        }

        const getStepIcon = (step) => {
          const maneuver = (step.navigationInstruction?.maneuver || step.maneuver || '').toUpperCase()
          const instruction = (step.navigationInstruction?.instructions || step.instructions || '').toLowerCase()

          if (maneuver.includes('ROUNDABOUT')) return '↺'
          if (maneuver.includes('U_TURN') || instruction.includes('u-turn')) return '↻'
          if (maneuver.includes('LEFT') || instruction.includes('left')) return '↰'
          if (maneuver.includes('RIGHT') || instruction.includes('right')) return '↱'
          if (maneuver.includes('MERGE') || instruction.includes('merge')) return '⇄'
          if (maneuver.includes('FERRY') || instruction.includes('ferry')) return '⛴'
          if (maneuver.includes('DEPART') || instruction.includes('depart')) return '▶'
          if (maneuver.includes('ARRIVE') || instruction.includes('arrive')) return '✓'
          if (instruction.includes('continue') || instruction.includes('straight')) return '↑'
          return '•'
        }

        directionsPanel.innerHTML = ''
        route.legs?.forEach((leg) => {
          leg.steps?.forEach((step) => {
            const stepEl = document.createElement('div')
            stepEl.className = 'directions-step'
            const instruction = step.navigationInstruction?.instructions || step.instructions || ''
            const distanceText = step.distanceMeters != null ? formatDistance(step.distanceMeters) : ''
            const icon = getStepIcon(step)
            stepEl.innerHTML = `
              <div class="directions-step__body">
                <div class="directions-step__icon" aria-hidden="true">${icon}</div>
                <div>
                  <div class="directions-step__instruction">${instruction}</div>
                  ${distanceText ? `<div class="directions-step__meta">${distanceText}</div>` : ''}
                </div>
              </div>
            `
            directionsPanel.appendChild(stepEl)
          })
        })

        const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLon}&destination=${destinationLat},${destinationLon}&travelmode=${travelMode.toLowerCase()}`
        setDirectionsUrl(url)
        setRouteError(null)
        setModalError(null)
        if (closeModalOnSuccess) {
          setIsModalOpen(false)
          setCloseModalOnSuccess(false)
        }
      } catch (error) {
        const message = `Directions request failed: ${error.message || 'unknown error'}`
        setRouteError(message)
        setModalError(message)
        console.error('Directions request failed:', error)
      }
    }

    const loadGoogleMaps = async () => {
      try {
        loadGoogleMapsBootstrap(mapsApiKey)
        await renderDirections()
      } catch (error) {
        console.error('Google Maps failed to load', error)
      }
    }

    loadGoogleMaps()
  }, [mapsApiKey, hasRoute, originLat, originLon, destinationLat, destinationLon, travelMode])

  return (
    <>
      <main className="commutes">
      <button className="back-button" type="button" onClick={() => window.history.back()}>
        ← Back to Markets
      </button>
      <div className="commutes-map" aria-label="Map">
        <div className="map-view" />
        <div id="directions-panel-wrapper">
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="google-directions-link"
            >
              Open in Google Maps
            </a>
          )}
          <div id="directions-panel" />
        </div>
      </div>

      <div className="commutes-info">
        <div className="commutes-destinations">
          <div className="destinations-container">
            <div className="destination-list" />
            <button className="add-button" type="button" onClick={() => {
              setSelectedTravelMode(travelMode)
              setIsModalOpen(true)
            }}>
              <svg aria-label="Add Icon" width="24px" height="24px" xmlns="http://www.w3.org/2000/svg">
                <use href="#commutes-add-icon" />
              </svg>
              <div className="label">Choose mode of transportation</div>
            </button>
          </div>
          <button className="left-control hide" data-direction="-1" aria-label="Scroll left">
            <svg width="24px" height="24px" xmlns="http://www.w3.org/2000/svg" data-direction="-1">
              <use href="#commutes-chevron-left-icon" data-direction="-1" />
            </svg>
          </button>
          <button className="right-control hide" data-direction="1" aria-label="Scroll right">
            <svg width="24px" height="24px" xmlns="http://www.w3.org/2000/svg" data-direction="1">
              <use href="#commutes-chevron-right-icon" data-direction="1" />
            </svg>
          </button>
        </div>
      </div>
      </main>

      <div className={isModalOpen ? 'commutes-modal-container show' : 'commutes-modal-container'}>
        <div className="commutes-modal" role="dialog" aria-modal="true" aria-labelledby="add-edit-heading">
          <div className="content">
            <h2 id="add-edit-heading" className="heading">
              {destinationName ? `Choose travel mode to ${destinationName}` : 'Choose travel mode'}
            </h2>
            <form id="destination-form" onSubmit={(event) => event.preventDefault()}>
              <div className="error-message" role="alert">
                {modalError}
              </div>
              <div className="travel-modes">
                <input
                  type="radio"
                  name="travel-mode"
                  id="driving-mode"
                  value="DRIVING"
                  aria-label="Driving travel mode"
                  checked={selectedTravelMode === 'DRIVING'}
                  onChange={(event) => setSelectedTravelMode(event.target.value)}
                />
                <label htmlFor="driving-mode" className="left-label" title="Driving travel mode">
                  <svg aria-label="Driving icon" xmlns="http://www.w3.org/2000/svg">
                    <use href="#commutes-driving-icon" />
                  </svg>
                </label>
                <input
                  type="radio"
                  name="travel-mode"
                  id="transit-mode"
                  value="TRANSIT"
                  aria-label="Public transit travel mode"
                  checked={selectedTravelMode === 'TRANSIT'}
                  onChange={(event) => setSelectedTravelMode(event.target.value)}
                />
                <label htmlFor="transit-mode" title="Public transit travel mode">
                  <svg aria-label="Public transit icon" xmlns="http://www.w3.org/2000/svg">
                    <use href="#commutes-transit-icon" />
                  </svg>
                </label>
                <input
                  type="radio"
                  name="travel-mode"
                  id="bicycling-mode"
                  value="BICYCLING"
                  aria-label="Bicycling travel mode"
                  checked={selectedTravelMode === 'BICYCLING'}
                  onChange={(event) => setSelectedTravelMode(event.target.value)}
                />
                <label htmlFor="bicycling-mode" title="Bicycling travel mode">
                  <svg aria-label="Bicycling icon" xmlns="http://www.w3.org/2000/svg">
                    <use href="#commutes-bicycling-icon" />
                  </svg>
                </label>
                <input
                  type="radio"
                  name="travel-mode"
                  id="walking-mode"
                  value="WALKING"
                  aria-label="Walking travel mode"
                  checked={selectedTravelMode === 'WALKING'}
                  onChange={(event) => setSelectedTravelMode(event.target.value)}
                />
                <label htmlFor="walking-mode" className="right-label" title="Walking travel mode">
                  <svg aria-label="Walking icon" xmlns="http://www.w3.org/2000/svg">
                    <use href="#commutes-walking-icon" />
                  </svg>
                </label>
              </div>
            </form>
            <div className="modal-action-bar">
              <button className="delete-destination-button hide" type="button">
                Delete
              </button>
              <button className="cancel-button" type="button" onClick={() => {
                setIsModalOpen(false)
                setModalError(null)
              }}>
                Cancel
              </button>
              <button className="add-destination-button" type="button" onClick={() => {
                setCloseModalOnSuccess(true)
                setRouteError(null)
                setModalError(null)
                setTravelMode(selectedTravelMode)
              }}>
                Apply
              </button>
              <button className="edit-destination-button hide" type="button">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      <svg className="hide">
        <defs>
          <symbol id="commutes-initial-icon">
            <path d="M41 20H18.6c-9.5 0-10.8 13.5 0 13.5h14.5C41 33.5 41 45 33 45H17.7" stroke="#D2E3FC" strokeWidth="5" />
            <path
              d="M41 22c.2 0 .4 0 .6-.2l.4-.5c.3-1 .7-1.7 1.1-2.5l2-3c.8-1 1.5-2 2-3 .6-1 .9-2.3.9-3.8 0-2-.7-3.6-2-5-1.4-1.3-3-2-5-2s-3.6.7-5 2c-1.3 1.4-2 3-2 5 0 1.4.3 2.6.8 3.6s1.2 2 2 3.2c.9 1 1.6 2 2 2.8.5.9 1 1.7 1.2 2.7l.4.5.6.2Zm0-10.5c-.7 0-1.3-.2-1.8-.7-.5-.5-.7-1.1-.7-1.8s.2-1.3.7-1.8c.5-.5 1.1-.7 1.8-.7s1.3.2 1.8.7c.5.5.7 1.1.7 1.8s-.2 1.3-.7 1.8c-.5.5-1.1.7-1.8.7Z"
              fill="#185ABC"
            />
            <path d="m12 32-8 6v12h5v-7h6v7h5V38l-8-6Z" fill="#4285F4" />
          </symbol>
        </defs>
      </svg>

      <svg className="hide">
        <defs>
          <symbol id="commutes-add-icon">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </symbol>
        </defs>
      </svg>

      <svg className="hide">
        <defs>
          <symbol id="commutes-driving-icon">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z" />
            <circle cx="7.5" cy="14.5" r="1.5" />
            <circle cx="16.5" cy="14.5" r="1.5" />
          </symbol>
        </defs>
      </svg>

      <svg className="hide">
        <defs>
          <symbol id="commutes-transit-icon">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zm5.66 3H6.43c.61-.52 2.06-1 5.57-1 3.71 0 5.12.46 5.66 1zM11 7v3H6V7h5zm2 0h5v3h-5V7zm3.5 10h-9c-.83 0-1.5-.67-1.5-1.5V12h12v3.5c0 .83-.67 1.5-1.5 1.5z" />
            <circle cx="8.5" cy="14.5" r="1.5" />
            <circle cx="15.5" cy="14.5" r="1.5" />
          </symbol>
        </defs>
      </svg>

      <svg className="hide">
        <defs>
          <symbol id="commutes-bicycling-icon">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" />
          </symbol>
        </defs>
      </svg>

      <svg className="hide">
        <defs>
          <symbol id="commutes-walking-icon">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.56-.89-1.68-1.25-2.65-.84L6 8.3V13h2V9.6l1.8-.7" />
          </symbol>
        </defs>
      </svg>

      <svg className="hide">
        <defs>
          <symbol id="commutes-chevron-left-icon">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
          </symbol>
        </defs>
      </svg>

      <svg className="hide">
        <defs>
          <symbol id="commutes-chevron-right-icon">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path xmlns="http://www.w3.org/2000/svg" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
          </symbol>
        </defs>
      </svg>

      <svg className="hide">
        <defs>
          <symbol id="commutes-arrow-icon">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4v3z" />
          </symbol>
        </defs>
      </svg>

      <svg className="hide">
        <defs>
          <symbol id="commutes-directions-icon">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M22.43 10.59l-9.01-9.01c-.75-.75-2.07-.76-2.83 0l-9 9c-.78.78-.78 2.04 0 2.82l9 9c.39.39.9.58 1.41.58.51 0 1.02-.19 1.41-.58l8.99-8.99c.79-.76.8-2.02.03-2.82zm-10.42 10.4l-9-9 9-9 9 9-9 9zM8 11v4h2v-3h4v2.5l3.5-3.5L14 7.5V10H9c-.55 0-1 .45-1 1z" />
          </symbol>
        </defs>
      </svg>

      <svg className="hide">
        <defs>
          <symbol id="commutes-edit-icon">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
          </symbol>
        </defs>
      </svg>
    </>
  )
}

export default Directions