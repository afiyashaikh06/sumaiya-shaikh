# Usage Examples and Code Samples

## Overview

This document provides comprehensive examples of how to use the URL Shortener application, including API usage, integration patterns, and practical use cases. Examples are provided for different programming languages and scenarios.

## Basic Usage Examples

### 1. Web Interface Usage

#### Creating a Short URL via Web Interface

**Step-by-Step Process:**

1. **Open the Application**
   ```
   Navigate to: http://localhost:5001
   ```

2. **Enter a URL**
   ```
   Input Field: https://www.example.com/very/long/url/path/with/parameters?param1=value1&param2=value2
   ```

3. **Submit the Form**
   ```
   Click "Shrink" button
   ```

4. **Result**
   ```
   Short URL created: http://localhost:5001/H1fBLN6og
   Displayed in table with:
   - Full URL: https://www.example.com/very/long/url/path/with/parameters?param1=value1&param2=value2
   - Short URL: H1fBLN6og
   - Clicks: 0
   - Delete button
   ```

#### Using a Short URL

**Access Pattern:**
```
Original URL: https://www.example.com/very/long/url/path
Short URL: http://localhost:5001/H1fBLN6og

When accessing the short URL:
1. Browser requests: http://localhost:5001/H1fBLN6og
2. Server responds with: 302 Redirect to https://www.example.com/very/long/url/path
3. Click counter increments: 0 → 1
4. Browser navigates to original URL
```

### 2. API Usage Examples

#### Using cURL

**Create a Short URL:**
```bash
# Basic URL shortening
curl -X POST http://localhost:5001/shorturls \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "fullUrl=https://www.google.com"

# Response: 302 Redirect to /
# Check the homepage to see the new short URL
```

**Access a Short URL:**
```bash
# Get redirect information
curl -I http://localhost:5001/H1fBLN6og

# Response:
# HTTP/1.1 302 Found
# Location: https://www.google.com
# ...
```

**Delete a URL:**
```bash
# Delete by MongoDB ObjectId (obtained from homepage)
curl -X POST http://localhost:5001/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "_method=DELETE"

# Response: 302 Redirect to /
```

#### Using JavaScript/Node.js

**Create Short URL:**
```javascript
const axios = require('axios');
const qs = require('querystring');

async function createShortUrl(originalUrl) {
  try {
    const response = await axios.post('http://localhost:5001/shorturls', 
      qs.stringify({ fullUrl: originalUrl }), 
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        maxRedirects: 0,
        validateStatus: (status) => status === 302
      }
    );
    
    console.log('Short URL created successfully');
    return true;
  } catch (error) {
    console.error('Error creating short URL:', error.response?.status);
    return false;
  }
}

// Usage
createShortUrl('https://www.example.com/long/url');
```

**Fetch All URLs (Screen Scraping):**
```javascript
const axios = require('axios');
const cheerio = require('cheerio');

async function getAllUrls() {
  try {
    const response = await axios.get('http://localhost:5001');
    const $ = cheerio.load(response.data);
    
    const urls = [];
    $('table tbody tr').each((index, element) => {
      const fullUrl = $(element).find('td:nth-child(1) a').attr('href');
      const shortUrl = $(element).find('td:nth-child(2) a').attr('href');
      const clicks = $(element).find('td:nth-child(3)').text();
      const deleteForm = $(element).find('td:nth-child(4) form');
      const id = deleteForm.attr('action')?.substring(1);
      
      urls.push({
        id,
        fullUrl,
        shortUrl,
        clicks: parseInt(clicks) || 0
      });
    });
    
    return urls;
  } catch (error) {
    console.error('Error fetching URLs:', error);
    return [];
  }
}

// Usage
getAllUrls().then(urls => {
  console.log('All URLs:', urls);
});
```

#### Using Python

**Create Short URL:**
```python
import requests

def create_short_url(original_url, base_url="http://localhost:5001"):
    """Create a short URL using the URL shortener service."""
    try:
        response = requests.post(
            f"{base_url}/shorturls",
            data={"fullUrl": original_url},
            allow_redirects=False
        )
        
        if response.status_code == 302:
            print(f"Short URL created for: {original_url}")
            return True
        else:
            print(f"Error: {response.status_code}")
            return False
            
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return False

# Usage
create_short_url("https://www.python.org")
```

**Get URL Information:**
```python
import requests
from bs4 import BeautifulSoup

def get_all_urls(base_url="http://localhost:5001"):
    """Fetch all URLs from the shortener service."""
    try:
        response = requests.get(base_url)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        urls = []
        
        for row in soup.find('table').find('tbody').find_all('tr'):
            cells = row.find_all('td')
            if len(cells) >= 4:
                full_url = cells[0].find('a')['href']
                short_id = cells[1].find('a')['href']
                clicks = int(cells[2].get_text().strip())
                
                # Extract ID from delete form
                delete_form = cells[3].find('form')
                url_id = delete_form['action'][1:] if delete_form else None
                
                urls.append({
                    'id': url_id,
                    'full_url': full_url,
                    'short_id': short_id,
                    'clicks': clicks
                })
        
        return urls
        
    except requests.RequestException as e:
        print(f"Error fetching URLs: {e}")
        return []

# Usage
urls = get_all_urls()
for url in urls:
    print(f"Short: {url['short_id']} -> Full: {url['full_url']} (Clicks: {url['clicks']})")
```

## Advanced Integration Examples

### 1. URL Shortener Client Library

**JavaScript/Node.js Client:**
```javascript
class UrlShortenerClient {
  constructor(baseUrl = 'http://localhost:5001') {
    this.baseUrl = baseUrl;
    this.axios = require('axios');
    this.qs = require('querystring');
  }

  async createShortUrl(originalUrl) {
    try {
      const response = await this.axios.post(
        `${this.baseUrl}/shorturls`,
        this.qs.stringify({ fullUrl: originalUrl }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          maxRedirects: 0,
          validateStatus: (status) => status === 302
        }
      );
      
      return { success: true, message: 'Short URL created' };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to create short URL: ${error.message}` 
      };
    }
  }

  async getRedirectUrl(shortId) {
    try {
      const response = await this.axios.get(
        `${this.baseUrl}/${shortId}`,
        { maxRedirects: 0, validateStatus: (status) => status === 302 }
      );
      
      return {
        success: true,
        redirectUrl: response.headers.location
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: false, error: 'Short URL not found' };
      }
      return { success: false, error: `Error: ${error.message}` };
    }
  }

  async deleteUrl(urlId) {
    try {
      const response = await this.axios.post(
        `${this.baseUrl}/${urlId}`,
        this.qs.stringify({ _method: 'DELETE' }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          maxRedirects: 0,
          validateStatus: (status) => status === 302
        }
      );
      
      return { success: true, message: 'URL deleted' };
    } catch (error) {
      return { success: false, error: `Failed to delete URL: ${error.message}` };
    }
  }
}

// Usage Example
const client = new UrlShortenerClient();

async function example() {
  // Create short URL
  const result = await client.createShortUrl('https://www.github.com');
  console.log('Create result:', result);

  // Get redirect URL
  const redirect = await client.getRedirectUrl('H1fBLN6og');
  console.log('Redirect result:', redirect);

  // Delete URL
  const deleteResult = await client.deleteUrl('507f1f77bcf86cd799439011');
  console.log('Delete result:', deleteResult);
}

example();
```

### 2. Batch URL Processing

**Bulk URL Shortening:**
```javascript
const UrlShortenerClient = require('./url-shortener-client');

class BulkUrlProcessor {
  constructor(baseUrl) {
    this.client = new UrlShortenerClient(baseUrl);
  }

  async processUrls(urls, options = {}) {
    const { batchSize = 5, delay = 1000 } = options;
    const results = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);
      
      const batchPromises = batch.map(async (url) => {
        const result = await this.client.createShortUrl(url);
        return { url, result };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches to avoid overwhelming the server
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return results;
  }

  generateReport(results) {
    const successful = results.filter(r => r.result.success).length;
    const failed = results.filter(r => !r.result.success).length;

    console.log('\n=== Bulk Processing Report ===');
    console.log(`Total URLs processed: ${results.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success rate: ${((successful / results.length) * 100).toFixed(2)}%`);

    if (failed > 0) {
      console.log('\nFailed URLs:');
      results
        .filter(r => !r.result.success)
        .forEach(r => console.log(`- ${r.url}: ${r.result.error}`));
    }
  }
}

// Usage Example
async function bulkExample() {
  const processor = new BulkUrlProcessor('http://localhost:5001');
  
  const urls = [
    'https://www.google.com',
    'https://www.github.com',
    'https://www.stackoverflow.com',
    'https://www.mozilla.org',
    'https://www.w3.org'
  ];

  const results = await processor.processUrls(urls, {
    batchSize: 2,
    delay: 500
  });

  processor.generateReport(results);
}

bulkExample();
```

### 3. URL Analytics and Monitoring

**Analytics Collector:**
```javascript
const UrlShortenerClient = require('./url-shortener-client');
const cheerio = require('cheerio');

class UrlAnalytics {
  constructor(baseUrl) {
    this.client = new UrlShortenerClient(baseUrl);
    this.baseUrl = baseUrl;
  }

  async collectAnalytics() {
    try {
      const response = await this.client.axios.get(this.baseUrl);
      const $ = cheerio.load(response.data);
      
      const analytics = {
        totalUrls: 0,
        totalClicks: 0,
        urls: [],
        topUrls: [],
        summary: {}
      };

      $('table tbody tr').each((index, element) => {
        const fullUrl = $(element).find('td:nth-child(1) a').attr('href');
        const shortId = $(element).find('td:nth-child(2) a').text();
        const clicks = parseInt($(element).find('td:nth-child(3)').text()) || 0;
        
        analytics.urls.push({
          fullUrl,
          shortId,
          clicks,
          domain: this.extractDomain(fullUrl)
        });

        analytics.totalClicks += clicks;
      });

      analytics.totalUrls = analytics.urls.length;
      analytics.topUrls = this.getTopUrls(analytics.urls, 5);
      analytics.summary = this.generateSummary(analytics.urls);

      return analytics;
    } catch (error) {
      throw new Error(`Failed to collect analytics: ${error.message}`);
    }
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  getTopUrls(urls, limit = 5) {
    return urls
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit)
      .map(url => ({
        shortId: url.shortId,
        fullUrl: url.fullUrl,
        clicks: url.clicks
      }));
  }

  generateSummary(urls) {
    const domainStats = {};
    let totalClicks = 0;

    urls.forEach(url => {
      const domain = url.domain;
      if (!domainStats[domain]) {
        domainStats[domain] = { count: 0, clicks: 0 };
      }
      domainStats[domain].count++;
      domainStats[domain].clicks += url.clicks;
      totalClicks += url.clicks;
    });

    const avgClicksPerUrl = urls.length > 0 ? totalClicks / urls.length : 0;
    const mostPopularDomain = Object.entries(domainStats)
      .sort(([,a], [,b]) => b.clicks - a.clicks)[0];

    return {
      averageClicksPerUrl: Math.round(avgClicksPerUrl * 100) / 100,
      totalDomains: Object.keys(domainStats).length,
      domainStats,
      mostPopularDomain: mostPopularDomain ? {
        domain: mostPopularDomain[0],
        ...mostPopularDomain[1]
      } : null
    };
  }

  printReport(analytics) {
    console.log('\n=== URL Shortener Analytics Report ===');
    console.log(`Total URLs: ${analytics.totalUrls}`);
    console.log(`Total Clicks: ${analytics.totalClicks}`);
    console.log(`Average Clicks per URL: ${analytics.summary.averageClicksPerUrl}`);
    console.log(`Unique Domains: ${analytics.summary.totalDomains}`);

    if (analytics.summary.mostPopularDomain) {
      const mpd = analytics.summary.mostPopularDomain;
      console.log(`Most Popular Domain: ${mpd.domain} (${mpd.count} URLs, ${mpd.clicks} clicks)`);
    }

    console.log('\n=== Top 5 URLs by Clicks ===');
    analytics.topUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url.shortId} -> ${url.fullUrl} (${url.clicks} clicks)`);
    });

    console.log('\n=== Domain Statistics ===');
    Object.entries(analytics.summary.domainStats)
      .sort(([,a], [,b]) => b.clicks - a.clicks)
      .forEach(([domain, stats]) => {
        console.log(`${domain}: ${stats.count} URLs, ${stats.clicks} clicks`);
      });
  }
}

// Usage Example
async function analyticsExample() {
  const analytics = new UrlAnalytics('http://localhost:5001');
  
  try {
    const data = await analytics.collectAnalytics();
    analytics.printReport(data);
    
    // Export to JSON
    require('fs').writeFileSync(
      'analytics-report.json', 
      JSON.stringify(data, null, 2)
    );
    console.log('\nReport saved to analytics-report.json');
    
  } catch (error) {
    console.error('Analytics failed:', error.message);
  }
}

analyticsExample();
```

## Integration Patterns

### 1. Express.js Middleware Integration

**URL Shortener Middleware:**
```javascript
const UrlShortenerClient = require('./url-shortener-client');

function createUrlShortenerMiddleware(options = {}) {
  const client = new UrlShortenerClient(options.baseUrl);
  
  return {
    // Middleware to create short URLs
    createShortUrl: async (req, res, next) => {
      try {
        const { url } = req.body;
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        const result = await client.createShortUrl(url);
        if (result.success) {
          req.shortUrlResult = result;
          next();
        } else {
          res.status(500).json({ error: result.error });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    },

    // Middleware to expand short URLs
    expandUrl: async (req, res, next) => {
      try {
        const { shortId } = req.params;
        const result = await client.getRedirectUrl(shortId);
        
        if (result.success) {
          req.expandedUrl = result.redirectUrl;
          next();
        } else {
          res.status(404).json({ error: 'Short URL not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}

// Usage in Express app
const express = require('express');
const app = express();
const urlShortener = createUrlShortenerMiddleware({
  baseUrl: 'http://localhost:5001'
});

app.use(express.json());

// Create short URL endpoint
app.post('/api/shorten', urlShortener.createShortUrl, (req, res) => {
  res.json({ 
    message: 'URL shortened successfully',
    result: req.shortUrlResult 
  });
});

// Expand short URL endpoint
app.get('/api/expand/:shortId', urlShortener.expandUrl, (req, res) => {
  res.json({ 
    shortId: req.params.shortId,
    expandedUrl: req.expandedUrl 
  });
});

app.listen(3000, () => {
  console.log('API server running on port 3000');
});
```

### 2. React Frontend Integration

**React Hook for URL Shortening:**
```jsx
import { useState, useCallback } from 'react';

const useUrlShortener = (baseUrl = 'http://localhost:5001') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createShortUrl = useCallback(async (originalUrl) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/shorturls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ fullUrl: originalUrl }),
        redirect: 'manual'
      });

      if (response.status === 302) {
        setLoading(false);
        return { success: true };
      } else {
        throw new Error('Failed to create short URL');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, [baseUrl]);

  const getUrls = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(baseUrl);
      const html = await response.text();
      
      // Parse HTML to extract URLs (simplified)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('table tbody tr');
      
      const urls = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        return {
          fullUrl: cells[0]?.querySelector('a')?.href || '',
          shortId: cells[1]?.querySelector('a')?.textContent || '',
          clicks: parseInt(cells[2]?.textContent || '0'),
        };
      });

      setLoading(false);
      return urls;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  }, [baseUrl]);

  return {
    createShortUrl,
    getUrls,
    loading,
    error
  };
};

// React Component using the hook
const UrlShortenerApp = () => {
  const [url, setUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const { createShortUrl, getUrls, loading, error } = useUrlShortener();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    const result = await createShortUrl(url);
    if (result.success) {
      setUrl('');
      // Refresh the list
      const updatedUrls = await getUrls();
      setUrls(updatedUrls);
    }
  };

  const loadUrls = async () => {
    const urlList = await getUrls();
    setUrls(urlList);
  };

  return (
    <div className="url-shortener-app">
      <h1>URL Shortener</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to shorten"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>

      {error && <div className="error">Error: {error}</div>}

      <button onClick={loadUrls} disabled={loading}>
        Load URLs
      </button>

      <div className="url-list">
        {urls.map((urlItem, index) => (
          <div key={index} className="url-item">
            <strong>Short:</strong> {urlItem.shortId}<br/>
            <strong>Full:</strong> {urlItem.fullUrl}<br/>
            <strong>Clicks:</strong> {urlItem.clicks}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrlShortenerApp;
```

## Testing Examples

### 1. Unit Tests

**Jest Test Suite:**
```javascript
const UrlShortenerClient = require('../url-shortener-client');
const axios = require('axios');

jest.mock('axios');
const mockedAxios = axios;

describe('UrlShortenerClient', () => {
  let client;

  beforeEach(() => {
    client = new UrlShortenerClient('http://localhost:5001');
    jest.clearAllMocks();
  });

  describe('createShortUrl', () => {
    it('should create short URL successfully', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 302,
        headers: { location: '/' }
      });

      const result = await client.createShortUrl('https://example.com');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Short URL created');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5001/shorturls',
        'fullUrl=https%3A//example.com',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      );
    });

    it('should handle creation failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const result = await client.createShortUrl('https://example.com');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create short URL');
    });
  });

  describe('getRedirectUrl', () => {
    it('should get redirect URL successfully', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 302,
        headers: { location: 'https://example.com' }
      });

      const result = await client.getRedirectUrl('abc123');

      expect(result.success).toBe(true);
      expect(result.redirectUrl).toBe('https://example.com');
    });

    it('should handle not found error', async () => {
      const error = new Error('Not found');
      error.response = { status: 404 };
      mockedAxios.get.mockRejectedValue(error);

      const result = await client.getRedirectUrl('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Short URL not found');
    });
  });
});
```

### 2. Integration Tests

**Integration Test Suite:**
```javascript
const request = require('supertest');
const cheerio = require('cheerio');

describe('URL Shortener Integration Tests', () => {
  const baseUrl = 'http://localhost:5001';
  let createdUrls = [];

  afterAll(async () => {
    // Cleanup created URLs
    for (const urlId of createdUrls) {
      try {
        await request(baseUrl)
          .post(`/${urlId}`)
          .send('_method=DELETE');
      } catch (error) {
        console.log(`Failed to cleanup URL ${urlId}`);
      }
    }
  });

  describe('Homepage', () => {
    it('should load homepage successfully', async () => {
      const response = await request(baseUrl).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('URL Shortener');
      expect(response.text).toContain('form');
      expect(response.text).toContain('table');
    });
  });

  describe('URL Creation', () => {
    it('should create a short URL', async () => {
      const testUrl = 'https://www.example.com/test';
      
      const response = await request(baseUrl)
        .post('/shorturls')
        .send(`fullUrl=${encodeURIComponent(testUrl)}`);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/');

      // Verify URL was created by checking homepage
      const homepageResponse = await request(baseUrl).get('/');
      expect(homepageResponse.text).toContain(testUrl);

      // Extract URL ID for cleanup
      const $ = cheerio.load(homepageResponse.text);
      $('table tbody tr').each((index, element) => {
        const fullUrl = $(element).find('td:nth-child(1) a').attr('href');
        if (fullUrl === testUrl) {
          const deleteForm = $(element).find('td:nth-child(4) form');
          const urlId = deleteForm.attr('action')?.substring(1);
          if (urlId) createdUrls.push(urlId);
        }
      });
    });

    it('should handle invalid URL gracefully', async () => {
      const response = await request(baseUrl)
        .post('/shorturls')
        .send('fullUrl=invalid-url');

      // The current implementation doesn't validate URLs,
      // so it will still create a record
      expect(response.status).toBe(302);
    });
  });

  describe('URL Redirection', () => {
    let shortId;

    beforeAll(async () => {
      // Create a test URL first
      await request(baseUrl)
        .post('/shorturls')
        .send('fullUrl=https://www.example.com/redirect-test');

      // Get the short ID
      const homepageResponse = await request(baseUrl).get('/');
      const $ = cheerio.load(homepageResponse.text);
      
      $('table tbody tr').each((index, element) => {
        const fullUrl = $(element).find('td:nth-child(1) a').attr('href');
        if (fullUrl === 'https://www.example.com/redirect-test') {
          shortId = $(element).find('td:nth-child(2) a').text();
          
          // Add to cleanup list
          const deleteForm = $(element).find('td:nth-child(4) form');
          const urlId = deleteForm.attr('action')?.substring(1);
          if (urlId) createdUrls.push(urlId);
        }
      });
    });

    it('should redirect to original URL', async () => {
      expect(shortId).toBeDefined();

      const response = await request(baseUrl)
        .get(`/${shortId}`)
        .expect(302);

      expect(response.headers.location).toBe('https://www.example.com/redirect-test');
    });

    it('should increment click counter', async () => {
      // Get initial click count
      const initialResponse = await request(baseUrl).get('/');
      const initial$ = cheerio.load(initialResponse.text);
      let initialClicks = 0;

      initial$('table tbody tr').each((index, element) => {
        const currentShortId = initial$(element).find('td:nth-child(2) a').text();
        if (currentShortId === shortId) {
          initialClicks = parseInt(initial$(element).find('td:nth-child(3)').text()) || 0;
        }
      });

      // Access the short URL
      await request(baseUrl).get(`/${shortId}`);

      // Check updated click count
      const updatedResponse = await request(baseUrl).get('/');
      const updated$ = cheerio.load(updatedResponse.text);
      let updatedClicks = 0;

      updated$('table tbody tr').each((index, element) => {
        const currentShortId = updated$(element).find('td:nth-child(2) a').text();
        if (currentShortId === shortId) {
          updatedClicks = parseInt(updated$(element).find('td:nth-child(3)').text()) || 0;
        }
      });

      expect(updatedClicks).toBe(initialClicks + 1);
    });

    it('should return 404 for non-existent short URL', async () => {
      const response = await request(baseUrl)
        .get('/nonexistent123')
        .expect(404);
    });
  });
});
```

These comprehensive examples demonstrate various ways to interact with and extend the URL Shortener application, from basic usage to advanced integration patterns and testing strategies.