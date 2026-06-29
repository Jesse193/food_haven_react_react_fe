export const parseCoordinate = (value) => {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const getMarketCoordinate = (market, keys) => {
  for (const key of keys) {
    const value = market[key]
    if (value != null && value !== '') return value
  }
  return null
}

export function parseMarketData(market) {
  if (!market) return {}
  
  let targetData = market.data ? market.data : market
  const normalizedMarket = targetData.attributes 
    ? { id: targetData.id, ...targetData.attributes } 
    : targetData

  const name = normalizedMarket.name || 'Market'
  const rawAddress = normalizedMarket.address || 'Address unavailable'
  
  const zipCodeRegex = /(?<=\s\b[A-Za-z. ]+\s)(\b\d{5}\b)\s*/
  let addressText = rawAddress
  let trailingDetailsText = null

  if (zipCodeRegex.test(rawAddress)) {
    const parts = rawAddress.split(zipCodeRegex)
    addressText = `${parts[0]}${parts[1]}`
    trailingDetailsText = parts[2]?.trim()
  }

  const siteValue = normalizedMarket.site || normalizedMarket.url || ''
  const isSiteUrl = /^(https?:\/\/|www\.)/i.test(siteValue)
  const descriptionValue = normalizedMarket.description || ''
  const rawLocationDetails = normalizedMarket.location_details || normalizedMarket.locationDetails || normalizedMarket.location || ''
  
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
  const splitBySemicolon = (text) => text.split(/\s*;\s*/).map((item) => sanitizeSegment(item)).filter(Boolean)

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

  const destLat = parseCoordinate(
    getMarketCoordinate(normalizedMarket, ['latitude', 'lat', 'location_latitude', 'locationLatitude', 'latitude_value', 'lat_value']),
  )
  const destLon = parseCoordinate(
    getMarketCoordinate(normalizedMarket, ['longitude', 'lon', 'lng', 'location_longitude', 'locationLongitude', 'longitude_value', 'lon_value']),
  )

  const acceptedPaymentValue = normalizedMarket.accepted_payment || normalizedMarket.acceptedPayment || ''
  const acceptedPayments = acceptedPaymentValue.split(/\s*;\s*/).map((p) => p.trim()).filter(Boolean)

  const snapOptionValue = normalizedMarket.snap_option || normalizedMarket.snapOption || ''
  const snapOptionItems = snapOptionValue.split(/\s*;\s*/).map((i) => i.trim()).filter(Boolean)

  const fnapValue = normalizedMarket.fnap || normalizedMarket.fnap_option || normalizedMarket.fnapOption || ''
  const fnapItems = fnapValue.split(/\s*;\s*/).map((i) => i.trim()).filter(Boolean)


  return {
    marketId: normalizedMarket.id || normalizedMarket.market_id,
    name,
    addressText,
    trailingDetailsText,
    locationDetailSegments,
    rawLocationDetails,
    siteValue,
    isSiteUrl,
    descriptionText: !descriptionLooksLikeLocation && normalizedMarket.description ? normalizedMarket.description : null,
    hasMarketCoordinates: destLat != null && destLon != null,
    destLat,
    destLon,
    acceptedPayments,
    snapOptionItems,
    fnapItems,
  }
}
