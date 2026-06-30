const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const handleResponse = async (response, endpoint) => {
  if (!response.ok) {
    throw new Error(`API request failed for ${endpoint} with status ${response.status}`);
  }

  return response.json();
};

const getUrl = async (endpoint) => {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  return handleResponse(response, endpoint);
};

const unwrapResource = (resource) => {
  if (!resource) return resource;
  if (resource.attributes) {
    return {
      id: resource.id,
      ...resource.attributes,
    };
  }
  return resource;
};

const normalizeSearchResponse = (response) => {
  if (Array.isArray(response)) return response.map(unwrapResource);

  if (response?.data) {
    if (Array.isArray(response.data)) return response.data.map(unwrapResource);
    return [unwrapResource(response.data)];
  }

  if (Array.isArray(response.markets)) return response.markets.map(unwrapResource);
  if (Array.isArray(response.results)) return response.results.map(unwrapResource);
  if (Array.isArray(response.data)) return response.data.map(unwrapResource);

  return [];
};

export const marketService = {
  searchMarketsNearby: async ({ latitude, longitude, radius, searchRadius, addressLine1, addressLine2, city, state, zipCode, address }) => {
    const params = new URLSearchParams();

    if (latitude != null && longitude != null) {
      params.set('latitude', latitude);
      params.set('longitude', longitude);
      if (radius != null) params.set('radius', radius);
      if (searchRadius != null) params.set('searchRadius', searchRadius);
    } else if (addressLine1 || addressLine2 || city || state || zipCode || address) {
      if (addressLine1) params.set('addressLine1', addressLine1);
      if (addressLine2) params.set('addressLine2', addressLine2);
      if (city) params.set('city', city);
      if (state) params.set('state', state);
      if (zipCode) params.set('zipCode', zipCode);
      if (address) params.set('address', address);
      if (radius != null) params.set('radius', radius);
      if (searchRadius != null) params.set('searchRadius', searchRadius);
    } else {
      throw new Error('searchMarketsNearby requires either coordinates or address fields.');
    }

    const response = await getUrl(`/markets/search?${params.toString()}`);
    return normalizeSearchResponse(response);
  },

  searchMarketsAddress: async ({addressLine1, addressLine2, city, state, zipCode, address }) => {
    const params = new URLSearchParams();

    if (addressLine1 || addressLine2 || city || state || zipCode || address) {
      if (addressLine1) params.set('addressLine1', addressLine1);
      if (addressLine2) params.set('addressLine2', addressLine2);
      if (city) params.set('city', city);
      if (state) params.set('state', state);
      if (zipCode) params.set('zipCode', zipCode);
      if (address) params.set('address', address);
    } else {
      throw new Error('searchMarketsAddress requires address fields.');
    }
    const response = await getUrl(`/markets/search?${params.toString()}`);
    return normalizeSearchResponse(response);
  },

  searchMarketsName: async ({name }) => {
    if (!name) throw new Error('searchMarketsName requires a market name.');
    const params = new URLSearchParams({ name });
    const response = await getUrl(`/markets/search?${params.toString()}`);
    return normalizeSearchResponse(response);
  },

  getMarket: async (id) => getUrl(`/markets/${id}`),

  fetchFavoriteMarkets: async (marketIds) => {
    if (!Array.isArray(marketIds) || marketIds.length === 0) return [];

    const params = new URLSearchParams();
    marketIds.forEach((id) => params.append('market_ids[]', id));
    return getUrl(`/favorites?${params.toString()}`);
  },


};