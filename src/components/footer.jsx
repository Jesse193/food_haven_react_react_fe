import '../assets/stylesheets/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="global-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
