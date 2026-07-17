const BASE_URL = import.meta.env.API_BASE_URL || '';

const normalizeToken = (token) => {
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
};

const getAuthHeaders = () => {
  const token = normalizeToken(localStorage.getItem('token'));
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response, endpoint) => {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      throw new Error(`Unauthorized request for ${endpoint}. Please log in again.`);
    }

    throw new Error(`API request failed for ${endpoint} with status ${response.status}`);
  }

  return response.json();
};

const getUrl = async (endpoint) => { 
  const response = await fetch(`${BASE_URL}${endpoint}`, { 
    headers: getAuthHeaders(), 
  }); 
  return handleResponse(response, endpoint); 
}; 

const unwrapFavorite = (response) => { 
  if (!response) return response; 
  
  let item = response;
  
  if (response.attributes) { 
    item = { id: response.id, ...response.attributes }; 
  } 

  return {
    ...item,
    id: String(item.id),
    marketId: String(item.marketId || item.market_id || item.market || '')
  };
}; 

export const favoritesService = { 
  addFavorite: async (marketId) => { 
    const response = await fetch(`${BASE_URL}/api/favorites`, { 
      method: 'POST', 
      headers: getAuthHeaders(), 
      body: JSON.stringify({ market: marketId }), 
    }); 
    const data = await handleResponse(response, '/api/favorites'); 
    return unwrapFavorite(data); 
  }, 

  removeFavorite: async (marketId) => { 
    const response = await fetch(`${BASE_URL}/api/favorites/${marketId}`, { 
      method: 'DELETE', 
      headers: getAuthHeaders(), 
    }); 
    return handleResponse(response, `/api/favorites/${marketId}`); 
  }, 

  getFavoriteMarkets: async () => { 
    return getUrl('/api/favorites')
      .then((serializerResult) => {
        if (serializerResult && serializerResult.data) {
          return serializerResult.data.map(unwrapFavorite);
        }
        return Array.isArray(serializerResult) ? serializerResult.map(unwrapFavorite) : [];
      })
      .catch((error) => {
        if (error.message.includes('Unauthorized')) {
          return [];
        }
        throw error;
      });
  }, 
};

