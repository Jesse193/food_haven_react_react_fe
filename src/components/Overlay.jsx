function Overlay() {
  const token = localStorage.getItem('token');
  
  return (
    <div className="overlay">
      {token ? (
        <p>Logged in</p>
      ) : (
        <p>Please log in to save your favorite markets.</p>
      )}
    </div>
  );
}
export default Overlay;