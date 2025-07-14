import { useState } from 'react';
import './UrlList.css';

interface Url {
  _id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  expiry: string;
  validity: number;
  isCustomShortcode: boolean;
  isExpired: boolean;
}

interface UrlListProps {
  urls: Url[];
}

export default function UrlList({ urls }: UrlListProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(`${process.env.BACKEND_URL}/${url}`);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatUrl = (url: string) => {
    if (url.length > 50) {
      return url.substring(0, 50) + '...';
    }
    return url;
  };

  const formatExpiry = (expiry: string) => {
    const expiryDate = new Date(expiry);
    const now = new Date();
    const isExpired = now > expiryDate;
    
    if (isExpired) {
      return 'Expired';
    }
    
    const timeDiff = expiryDate.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else if (minutes > 0) {
      return `${minutes}m left`;
    } else {
      return 'Expiring soon';
    }
  };

  const getExpiryStatus = (expiry: string) => {
    const expiryDate = new Date(expiry);
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const hoursLeft = timeDiff / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return 'expired';
    if (hoursLeft < 1) return 'expiring-soon';
    if (hoursLeft < 24) return 'expiring-today';
    return 'active';
  };

  return (
    <div className="url-list">
      <div className="list-header">
        <h2>Your Shortened URLs</h2>
        <div className="list-stats">
          <span className="stat-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {urls.length} URLs
          </span>
          <span className="stat-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {urls.reduce((total, url) => total + url.clicks, 0)} Clicks
          </span>
          <span className="stat-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {urls.filter(url => !url.isExpired).length} Active
          </span>
        </div>
      </div>

      <div className="urls-container">
        {urls.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>No URLs yet</h3>
            <p>Start by shortening your first URL above to see it here</p>
          </div>
        ) : (
          <div className="urls-grid">
            {urls.map((url) => (
              <div key={url._id} className={`url-card ${url.isExpired ? 'expired' : ''} ${getExpiryStatus(url.expiry)}`}>
                <div className="url-header">
                  <div className="url-info">
                    <div className="original-url">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="url-domain">{formatUrl(url.originalUrl)}</span>
                    </div>
                    <div className="url-metadata">
                      <div className="url-badges">
                        {url.isCustomShortcode && (
                          <span className="badge custom-badge">Custom</span>
                        )}
                        <span className={`badge expiry-badge ${getExpiryStatus(url.expiry)}`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {formatExpiry(url.expiry)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {url.isExpired && (
                  <div className="expired-warning">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    This link has expired and cannot be accessed
                  </div>
                )}
                
                <div className="short-url-section">
                  <div className="short-url-container">
                    <a 
                      href={`${process.env.BACKEND_URL}/${url.shortUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`short-url-link ${url.isExpired ? 'disabled' : ''}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {
                        process.env.BACKEND_URL?.includes('localhost') ? 
                          `${process.env.BACKEND_URL?.replace('http://', '')}/${url.shortUrl}` : 
                          `${process.env.BACKEND_URL?.replace('https://', '')}/${url.shortUrl}`
                      }
                    </a>
                    <button 
                      onClick={() => copyToClipboard(url.shortUrl)}
                      className={`copy-btn ${copiedUrl === url.shortUrl ? 'copied' : ''}`}
                      title="Copy to clipboard"
                      disabled={url.isExpired}
                    >
                      {copiedUrl === url.shortUrl ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="url-stats">
                  <div className="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{url.clicks} clicks</span>
                  </div>
                  <div className="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{url.validity} min validity</span>
                  </div>
                  <div className="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{new Date(url.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 