import '../assets/stylesheets/Header.css';

function Header() {
  return (
    <header className="global-header">
      <div className="header-content">
        <h1 className="site-title"><a href="/">Food Haven</a></h1>
        <nav className="header-links">
          <a href="/markets" className="header-link">Markets</a>
          <a href="/favorites" className="header-link">Favorites</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;