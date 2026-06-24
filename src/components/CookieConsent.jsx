// src/components/CookieConsent.jsx
import { useEffect, useState } from 'react';
import './CookieConsent.css';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-box">
        <p>We use cookies to improve your experience. Accept cookies to continue.</p>
        <button onClick={acceptCookies}>Accept</button>
      </div>
    </div>
  );
}