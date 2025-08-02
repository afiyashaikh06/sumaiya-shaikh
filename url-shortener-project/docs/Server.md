# Server Documentation

## Overview

The URL Shortener server is built with Express.js and provides a web application for creating and managing shortened URLs. This document covers the server architecture, configuration, middleware, route handlers, and deployment considerations.

**File:** `server.js`

## Application Architecture

### Technology Stack
- **Runtime:** Node.js
- **Web Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Template Engine:** EJS (Embedded JavaScript)
- **ID Generation:** shortid library

### Application Structure
```
url-shortener-project/
├── server.js          # Main server file
├── models/
│   └── shorturl.js    # URL data model
├── views/
│   └── index.ejs      # Main template
└── package.json       # Dependencies and scripts
```

## Server Configuration

### Constants and Environment Variables

```javascript
const PORT = 5001;
const LOCALHOST_IP = "127.0.0.1";
const MONGO_URI = `mongodb://${LOCALHOST_IP}:27017/Url_Shortner`;
```

| Variable     | Value                                      | Description |
|--------------|--------------------------------------------|-----------| 
| `PORT`       | `5001`                                     | Server port number |
| `LOCALHOST_IP` | `"127.0.0.1"`                           | Local MongoDB IP address |
| `MONGO_URI`  | `"mongodb://127.0.0.1:27017/Url_Shortner"` | MongoDB connection string |

### Dependencies

```javascript
const express = require("express");
const url_model = require("./models/shorturl.js");
const mongoose = require("mongoose");
```

| Dependency   | Purpose |
|--------------|---------|
| `express`    | Web application framework |
| `mongoose`   | MongoDB object modeling |
| `url_model`  | Custom URL data model |

## Database Connection

### Connection Function

```javascript
const connectMongoDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Successfully Connected to MongoDB !!");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
```

**Function:** `connectMongoDB(mongoURI)`

**Parameters:**
- `mongoURI` (string): MongoDB connection string

**Behavior:**
- Attempts to connect to MongoDB using Mongoose
- Logs success message on successful connection
- Logs error and exits process on connection failure
- Uses `process.exit(1)` to terminate application on database connection errors

**Error Handling:**
- Catches connection errors
- Logs error details to console
- Terminates process with exit code 1

## Middleware Configuration

### View Engine Setup
```javascript
app.set("view engine", "ejs");
```
- **Purpose:** Configures EJS as the template engine
- **Template Directory:** Default `views/` directory
- **File Extension:** `.ejs` files

### Body Parser Middleware
```javascript
app.use(express.urlencoded({ extended: false }));
```
- **Purpose:** Parses URL-encoded form data
- **Configuration:** `extended: false` uses querystring library (simpler parsing)
- **Content-Type:** Handles `application/x-www-form-urlencoded`

## Route Handlers

### 1. Homepage Route

**Route:** `GET /`

```javascript
app.get("/", async (req, res) => {
  const urlLists = await url_model.find();
  res.render("index", { shorturls: urlLists });
});
```

**Function Details:**
- **Purpose:** Displays the main page with all shortened URLs
- **Database Query:** Retrieves all URL records using `url_model.find()`
- **Template Rendering:** Renders `index.ejs` with `shorturls` data
- **Error Handling:** None (should be added for production)

**Template Data:**
- `shorturls`: Array of URL objects containing `full`, `short`, `clicks`, and `_id`

### 2. Create Short URL Route

**Route:** `POST /shorturls`

```javascript
app.post("/shorturls", async (req, res) => {
  await url_model.create({ full: req.body.fullUrl });
  res.redirect("/");
});
```

**Function Details:**
- **Purpose:** Creates a new shortened URL from form submission
- **Input:** `req.body.fullUrl` from form data
- **Database Operation:** Creates new URL record with auto-generated short ID
- **Response:** Redirects to homepage to show updated list
- **Error Handling:** None (should be added for production)

**Form Data Expected:**
- `fullUrl`: The original URL to be shortened

### 3. Redirect Route

**Route:** `GET /:shorturl`

```javascript
app.get("/:shorturl", async (req, res) => {
  const shorturl = await url_model.findOne({ short: req.params.shorturl });
  if (shorturl == null) return res.sendStatus(404);

  shorturl.clicks++;
  shorturl.save();

  await res.redirect(shorturl.full);
});
```

**Function Details:**
- **Purpose:** Redirects short URLs to original URLs and tracks clicks
- **Parameter:** `req.params.shorturl` - the short URL identifier
- **Database Query:** Finds URL by short identifier
- **Click Tracking:** Increments click counter and saves to database
- **Response:** 302 redirect to original URL or 404 if not found

**Flow:**
1. Extract short URL from path parameter
2. Query database for matching record
3. Return 404 if not found
4. Increment click counter
5. Save updated record
6. Redirect to original URL

### 4. Delete URL Route

**Route:** `POST /:id`

```javascript
app.post("/:id", async (req, res) => {
  const id = req.params.id;
  const deleteAction = await url_model.findOneAndDelete({ _id: id });
  if (deleteAction == null) return res.sendStatus(404);

  res.redirect("/");
});
```

**Function Details:**
- **Purpose:** Deletes a URL record by MongoDB ObjectId
- **Parameter:** `req.params.id` - MongoDB ObjectId
- **Database Operation:** Finds and deletes record in single operation
- **Response:** Redirects to homepage or returns 404 if not found

**Flow:**
1. Extract ObjectId from path parameter
2. Attempt to find and delete record
3. Return 404 if record not found
4. Redirect to homepage on successful deletion

## Server Startup

### Server Initialization
```javascript
app.listen(PORT, () => {
  connectMongoDB(MONGO_URI);
  console.log(`Server started ${PORT}`);
});
```

**Startup Sequence:**
1. Start Express server on specified port
2. Initialize MongoDB connection
3. Log server startup message

**Port Configuration:**
- Default port: `5001`
- Access URL: `http://localhost:5001`

## Error Handling

### Current Error Handling
The application has minimal error handling:
- Database connection errors terminate the process
- 404 responses for missing URLs
- No validation errors are handled
- No server errors are caught

### Recommended Error Handling Improvements

```javascript
// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Enhanced route with error handling
app.get("/", asyncHandler(async (req, res) => {
  try {
    const urlLists = await url_model.find();
    res.render("index", { shorturls: urlLists });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).render('error', { message: 'Database connection error' });
  }
}));
```

## Security Considerations

### Current Security Issues
1. **No input validation** on URLs
2. **No rate limiting** for URL creation
3. **No CSRF protection** for forms
4. **No authentication** for operations
5. **No sanitization** of user input

### Recommended Security Enhancements

```javascript
// Input validation middleware
const validateUrl = (req, res, next) => {
  const { fullUrl } = req.body;
  
  if (!fullUrl || typeof fullUrl !== 'string') {
    return res.status(400).json({ error: 'Valid URL required' });
  }
  
  try {
    new URL(fullUrl);
    next();
  } catch {
    res.status(400).json({ error: 'Invalid URL format' });
  }
};

// Rate limiting
const rateLimit = require('express-rate-limit');
const createLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many URLs created, please try again later'
});

app.post("/shorturls", createLimit, validateUrl, async (req, res) => {
  // Enhanced route handler
});
```

## Performance Considerations

### Current Performance Issues
1. **No database indexing** on frequently queried fields
2. **No connection pooling** configuration
3. **No caching** of frequently accessed URLs
4. **Blocking operations** without proper async handling

### Recommended Performance Improvements

```javascript
// Database indexing (in model file)
UrlSchema.index({ short: 1 });
UrlSchema.index({ createdAt: -1 });

// Connection pooling
mongoose.connect(MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// Caching middleware
const cache = new Map();
const cacheMiddleware = (req, res, next) => {
  const key = req.params.shorturl;
  if (cache.has(key)) {
    const url = cache.get(key);
    return res.redirect(url.full);
  }
  next();
};
```

## Environment Configuration

### Recommended Environment Variables

```javascript
// Use environment variables for configuration
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Url_Shortner';
const NODE_ENV = process.env.NODE_ENV || 'development';
```

### Environment File (.env)
```bash
PORT=5001
MONGODB_URI=mongodb://localhost:27017/Url_Shortner
NODE_ENV=development
SESSION_SECRET=your-secret-key
```

## Deployment Considerations

### Production Readiness Checklist

1. **Environment Variables:**
   - Use environment variables for all configuration
   - Secure database connection strings
   - Set appropriate NODE_ENV

2. **Error Handling:**
   - Implement global error handler
   - Add proper logging
   - Handle all async operations

3. **Security:**
   - Add input validation
   - Implement rate limiting
   - Use HTTPS in production
   - Add CSRF protection

4. **Performance:**
   - Add database indexes
   - Implement caching
   - Configure connection pooling
   - Add compression middleware

5. **Monitoring:**
   - Add health check endpoint
   - Implement logging
   - Add metrics collection

### Docker Configuration

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["node", "server.js"]
```

### Health Check Endpoint

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Testing Considerations

### Unit Tests
```javascript
// Example test structure
describe('URL Routes', () => {
  test('GET / should return homepage', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
  
  test('POST /shorturls should create new URL', async () => {
    const response = await request(app)
      .post('/shorturls')
      .send({ fullUrl: 'https://example.com' });
    expect(response.status).toBe(302);
  });
});
```

### Integration Tests
- Test database operations
- Test complete request/response cycles
- Test error scenarios
- Test edge cases