import { useState } from 'react';
import './UrlShortener.css';

interface UrlShortenerProps {
  onUrlShortened: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  token: string;
}

interface ShortenResponse {
  shortLink: string;
  expiry: string;
  originalUrl: string;
  validity: number;
  shortcode: string;
  id: string;
}

export default function UrlShortener({ onUrlShortened, isLoading, setIsLoading, token }: UrlShortenerProps) {
  const [url, setUrl] = useState('');
  const [validity, setValidity] = useState(30);
  const [shortcode, setShortcode] = useState('');
  const [recentlyShortened, setRecentlyShortened] = useState<ShortenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    setIsLoading(true);
    setRecentlyShortened(null);
    setError(null);

    try {
      const requestBody: { url: string; validity: number; shortcode?: string } = { 
        url, 
        validity 
      };
      
      // Add shortcode if provided
      if (shortcode.trim()) {
        requestBody.shortcode = shortcode.trim();
      }

      const response = await fetch(`${process.env.BACKEND_URL}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data: ShortenResponse = await response.json();
        setUrl('');
        setShortcode('');
        setValidity(30);
        setRecentlyShortened(data);
        onUrlShortened();
        
        setTimeout(() => {
          setRecentlyShortened(null);
        }, 10000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to shorten URL');
      }
    } catch (error) {
      console.error('Error shortening URL:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatExpiry = (expiry: string) => {
    const expiryDate = new Date(expiry);
    return expiryDate.toLocaleDateString() + ' ' + expiryDate.toLocaleTimeString();
  };

  return (
    <div className="url-shortener">
      <div className="shortener-header">
        <h2>Create Short Link</h2>
        <p>Transform your long URLs into short, shareable links with custom expiry</p>
      </div>
      
      <form onSubmit={handleSubmit} className="shortener-form">
        <div className="input-container">
          <div className="input-wrapper">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/your-very-long-url"
              required
              className="url-input"
            />
            <button type="submit" disabled={isLoading || !url} className="shorten-btn">
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Shorten
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="options-container">
          <div className="option-group">
            <label htmlFor="validity">Expiry (minutes):</label>
            <input
              type="number"
              id="validity"
              value={validity}
              onChange={(e) => setValidity(parseInt(e.target.value))}
              className="validity-input"
            />
          </div>
          
          <div className="option-group">
            <label htmlFor="shortcode">Custom shortcode (optional):</label>
            <input
              type="text"
              id="shortcode"
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              placeholder="my-custom-link"
              pattern="[a-zA-Z0-9]{3,20}"
              title="3-20 alphanumeric characters"
              className="shortcode-input"
            />
          </div>
        </div>
      </form>
      
      {error && (
        <div className="error-message">
          <div className="error-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <span>{error}</span>
        </div>
      )}
      
      {recentlyShortened && (
        <div className="success-message">
          <div className="success-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="success-content">
            <h3>URL Shortened Successfully!</h3>
            <div className="shortened-url-container">
              <div className="shortened-url">{recentlyShortened.shortLink}</div>
              <button 
                onClick={() => copyToClipboard(recentlyShortened.shortLink)}
                className="copy-success-btn"
                title="Copy to clipboard"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Copy
              </button>
            </div>
            <div className="url-details">
              <p><strong>Expires:</strong> {formatExpiry(recentlyShortened.expiry)}</p>
              <p><strong>Validity:</strong> {recentlyShortened.validity} minutes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 