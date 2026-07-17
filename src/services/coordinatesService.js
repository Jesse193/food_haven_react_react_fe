const BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const API_KEY = import.meta.env.MAPS_API_KEY;

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`Geocode request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK' || !data.results?.length) {
    const message = data.error_message || data.status || 'Unknown geocode error';
    throw new Error(`Geocode error: ${message}`);
  }

  return data;
};

export const getCoordinates = async (address) => {
  if (!address) {
    throw new Error('Address is required to fetch coordinates.');
  }

  const encodedAddress = encodeURIComponent(address);
  const url = `${BASE_URL}?address=${encodedAddress}&key=${API_KEY}`;
  const data = await handleResponse(await fetch(url));
  const { lat, lng } = data.results[0].geometry.location;

  return {
    latitude: lat,
    longitude: lng,
    raw: data,
  };
};
