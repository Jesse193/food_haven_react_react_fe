export const getCoordinates = async (address) => {
  if (!address) {
    throw new Error("Address is required");
  }

  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { address },
      (results, status) => {
        if (status !== "OK" || !results.length) {
          reject(new Error(`Geocode failed: ${status}`));
          return;
        }

        const location = results[0].geometry.location;

        resolve({
          latitude: location.lat(),
          longitude: location.lng(),
          raw: results
        });
      }
    );
  });
};
