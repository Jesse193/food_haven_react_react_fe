import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoritesService } from '../services/favoritesService';

function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  const token = localStorage.getItem('token'); 

  useEffect(() => {
    async function loadFavoritesData() {
      if (!token) return; 

      try {
        const data = await favoritesService.getFavoriteMarkets(); 
        setFavorites(data);
      } catch (error) {
        console.error("Error pulling favorites:", error);
      }
    }

    loadFavoritesData();
  }, [token]);

  const handleRemove = async (id, name) => {
    try {
      await favoritesService.removeFavorite(id);
      setFavorites(prev => prev.filter(fav => fav.id !== id));
    } catch (error) {
      console.error(`Error removing ${name}:`, error);
    }
  };


  return (
    <div className="favorites">
      {!token ? (
        <>
          <h1>Login to see your favorites</h1>
          <a className="login-button" href='/'>Login</a>
        </>
      ) : (
        <>
          <h1>Favorites</h1>
          {favorites.length === 0 ? (
            <p>No favorites found.</p>
          ) : (
            <ul>
              {favorites.map((favorite) => (
                <li key={favorite.id}>
                  <span className="market-name">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/markets/${favorite.id}`);
                      }}
                    >
                      {favorite.name || `Market #${favorite.id}`}
                    </a>
                  </span>
                  <br />
                  <button
                    type="button"
                    className="market-remove-favorite-button"
                    onClick={() => handleRemove(favorite.id, favorite.name)}
                  >
                    Remove from Favorites
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
export default Favorites;