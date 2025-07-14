import Url from '../models/Url.js';
import { generateShortUrl } from '../utils/generateShortUrl.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const shortenUrl = async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + validity);

    let shortUrl;
    let isCustomShortcode = false;

    // Check if custom shortcode is provided
    if (shortcode) {
      // Check if shortcode is already taken
      const existingUrl = await Url.findOne({ shortUrl: shortcode });
      if (existingUrl) {
        return res.status(400).json({ error: 'Custom shortcode is already taken' });
      }
      
      // Validate shortcode format (alphanumeric, 3-20 characters)
      if (!/^[a-zA-Z0-9]{3,20}$/.test(shortcode)) {
        return res.status(400).json({ error: 'Custom shortcode must be 3-20 alphanumeric characters' });
      }
      
      shortUrl = shortcode;
      isCustomShortcode = true;
    } else {
      // Generate unique short URL
      do {
        shortUrl = generateShortUrl();
      } while (await Url.findOne({ shortUrl }));
    }
    
    const urlData = { 
      originalUrl: url, 
      shortUrl, 
      userId: req.user._id,
      validity,
      expiry: expiryDate,
      isCustomShortcode
    };
    
    const urlDocument = new Url(urlData);
    await urlDocument.save();

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.BACKEND_URL || process.env.APP_URL
      : `http://localhost:${process.env.PORT || 5000}`;
    
    res.json({
      shortLink: `${baseUrl}/${shortUrl}`,
      expiry: expiryDate.toISOString(),
      originalUrl: url,
      validity,
      shortcode: shortUrl,
      id: urlDocument._id
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    // Transform response to match new format
    const transformedUrls = urls.map(url => ({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      clicks: url.clicks || 0,
      createdAt: url.createdAt,
      expiry: url.expiry,
      validity: url.validity,
      isCustomShortcode: url.isCustomShortcode || false,
      isExpired: new Date() > url.expiry
    }));
    
    res.json(transformedUrls);
  } catch (error) {
    console.error('Error getting URLs:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const redirectUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ shortUrl: req.params.shortUrl });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if URL has expired
    if (new Date() > url.expiry) {
      return res.status(410).json({ error: 'Short URL has expired' });
    }

    // Increment click count
    url.clicks = (url.clicks || 0) + 1;
    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Clean up expired URLs (can be called periodically)
export const cleanupExpiredUrls = async (req, res) => {
  try {
    const result = await Url.deleteMany({ expiry: { $lt: new Date() } });
    res.json({ 
      message: 'Expired URLs cleaned up successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning up expired URLs:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Password verification (placeholder for future implementation)
export const verifyPassword = async (req, res) => {
  try {
    // This would be implemented if password protection is added
    res.status(501).json({ error: 'Password protection not implemented' });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Toggle URL status (placeholder for future implementation)
export const toggleUrlStatus = async (req, res) => {
  try {
    // This would be implemented if URL enable/disable is added
    res.status(501).json({ error: 'URL status toggle not implemented' });
  } catch (error) {
    console.error('Error toggling URL status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reset password attempts (placeholder for future implementation)
export const resetPasswordAttempts = async (req, res) => {
  try {
    // This would be implemented if password protection is added
    res.status(501).json({ error: 'Password attempts reset not implemented' });
  } catch (error) {
    console.error('Error resetting password attempts:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 