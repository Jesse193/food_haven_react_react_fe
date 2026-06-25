import { useState, useEffect } from 'react';
import { favoritesService } from './services/favoritesService';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavoritesData = async () => {
      try {
        const userFavoriteRecords = await favoritesService.getFavoriteMarkets();
        setFavorites(userFavoriteRecords);
      } catch (error) {
        console.error("Error pulling favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFavoritesData();
  }, []);

  const handleRemove = async (favoriteId, favoriteName) => {
    try {
      await favoritesService.removeFavorite(favoriteId);
      setFavorites(prev => prev.filter(item => item.id !== favoriteId));
      alert(`Removed ${favoriteName} from favorites!`);
    } catch (removeError) {
      console.error('Error removing from favorites:', removeError);
      alert(`Failed to remove ${favoriteName}: ${removeError.message}`);
    }
  };

  if (loading) return <p>Loading favorites...</p>;

  return (
    <>
      <h1>Favorites</h1>
      <div>
        {favorites.length === 0 ? (
          <p>No favorites found.</p>
        ) : (
          <ul>
            {favorites.map((favorite) => (
              <li key={favorite.id} style={{ marginBottom: '10px' }}>
                <span>{favorite.name || `Market #${favorite.id}`}</span>
                <button 
                  type="button" 
                  className="market-remove-favorite-button" 
                  onClick={() => handleRemove(favorite.id, favorite.name)}
                  style={{ marginLeft: '10px' }}
                >
                  Remove from Favorites
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default Favorites;
