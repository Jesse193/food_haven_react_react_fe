import './header.css';

function Header() {
  return (
    <header className="global-header">
      <div className="header-content">
        <h1 className="site-title">Food Haven</h1>
        <nav className="header-links">
          <a href="/" className="header-link">Home</a>
          <a href="/markets" className="header-link">Markets</a>
          <a href="/favorites" className="header-link">Favorites</a>
        </nav>
      </div>
      <div className="header-content">
        <p>Welcome to Food Haven!</p>
      </div>
      <div className="header-content">
      </div>
    </header>
  );
}

export default Header;