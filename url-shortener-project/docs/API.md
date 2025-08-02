# API Documentation

## Overview

The URL Shortener API provides endpoints for creating shortened URLs, redirecting to original URLs, and managing URL records. The API is built with Express.js and uses MongoDB for data persistence.

**Base URL:** `http://localhost:5001`

## Authentication

Currently, this API does not require authentication. All endpoints are publicly accessible.

## Content Types

- **Request Content-Type:** `application/x-www-form-urlencoded` (for form submissions)
- **Response Content-Type:** `text/html` (for redirects and views) or `application/json` (for API responses)

## Endpoints

### 1. Get All URLs (Homepage)

**Endpoint:** `GET /`

**Description:** Retrieves and displays all shortened URLs in a web interface.

**Request:**
```http
GET / HTTP/1.1
Host: localhost:5001
```

**Response:**
- **Status:** 200 OK
- **Content-Type:** text/html
- **Body:** HTML page with all shortened URLs displayed in a table

**Response Data Structure:**
The page displays URLs with the following information:
- Full URL (original long URL)
- Short URL (generated short identifier)
- Click count
- Delete button

**Example Response Body Structure:**
```html
<!DOCTYPE html>
<html>
  <!-- HTML template with table of URLs -->
</html>
```

---

### 2. Create Short URL

**Endpoint:** `POST /shorturls`

**Description:** Creates a new shortened URL from a provided full URL.

**Request:**
```http
POST /shorturls HTTP/1.1
Host: localhost:5001
Content-Type: application/x-www-form-urlencoded

fullUrl=https://www.example.com/very/long/url/path
```

**Request Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| fullUrl   | string | Yes      | The original URL to be shortened |

**Request Body Example:**
```
fullUrl=https://www.example.com/very/long/url/path
```

**Response:**
- **Status:** 302 Found (Redirect)
- **Location:** `/` (redirects to homepage)

**Success Flow:**
1. Creates new URL record in database
2. Generates unique short identifier using shortid
3. Redirects to homepage showing the new short URL

**Error Handling:**
- Invalid URL format: Will create record but may cause issues on redirect
- Database connection error: Server error (500)

---

### 3. Redirect Short URL

**Endpoint:** `GET /:shorturl`

**Description:** Redirects to the original URL associated with the short URL identifier and increments the click counter.

**Request:**
```http
GET /abc123 HTTP/1.1
Host: localhost:5001
```

**Path Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| shorturl  | string | Yes      | The short URL identifier |

**Response (Success):**
- **Status:** 302 Found
- **Location:** `{original_url}` (redirects to the original URL)

**Response (Not Found):**
- **Status:** 404 Not Found

**Example Success Response:**
```http
HTTP/1.1 302 Found
Location: https://www.example.com/very/long/url/path
```

**Example Not Found Response:**
```http
HTTP/1.1 404 Not Found
```

**Side Effects:**
- Increments the click counter for the URL record
- Saves the updated click count to the database

---

### 4. Delete URL

**Endpoint:** `POST /:id`

**Description:** Deletes a URL record by its MongoDB ObjectId.

**Request:**
```http
POST /507f1f77bcf86cd799439011 HTTP/1.1
Host: localhost:5001
Content-Type: application/x-www-form-urlencoded

_method=DELETE
```

**Path Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| id        | string | Yes      | MongoDB ObjectId of the URL record |

**Request Body:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| _method   | string | No       | Method override (value: "DELETE") |

**Response (Success):**
- **Status:** 302 Found (Redirect)
- **Location:** `/` (redirects to homepage)

**Response (Not Found):**
- **Status:** 404 Not Found

**Example Success Response:**
```http
HTTP/1.1 302 Found
Location: /
```

**Example Not Found Response:**
```http
HTTP/1.1 404 Not Found
```

## Error Responses

### 404 Not Found
Returned when:
- Short URL identifier doesn't exist in database
- URL record ID doesn't exist for deletion

### 500 Internal Server Error
Returned when:
- Database connection issues
- MongoDB query failures
- Server configuration problems

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Database Schema

Each URL record contains:
- `_id`: MongoDB ObjectId (auto-generated)
- `full`: String - The original long URL
- `short`: String - The generated short identifier (auto-generated using shortid)
- `clicks`: Number - Click counter (default: 0)

## Example Usage

### Creating a Short URL
```bash
curl -X POST http://localhost:5001/shorturls \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "fullUrl=https://www.example.com/very/long/url"
```

### Using a Short URL
```bash
curl -I http://localhost:5001/abc123
# Returns 302 redirect to original URL
```

### Viewing All URLs
```bash
curl http://localhost:5001/
# Returns HTML page with all URLs
```

## Security Considerations

1. **URL Validation:** The API currently accepts any string as a URL. Consider implementing URL validation.
2. **XSS Protection:** User input is rendered in HTML templates. Ensure proper escaping.
3. **Rate Limiting:** No rate limiting is currently implemented.
4. **Authentication:** No authentication is required for any operations.
5. **HTTPS:** Consider enforcing HTTPS in production.

## Performance Notes

- Database queries are not optimized with indexes
- No caching mechanism is implemented
- Consider implementing connection pooling for high traffic

## Future Enhancements

1. Add JSON API responses alongside HTML responses
2. Implement user authentication and URL ownership
3. Add URL expiration functionality
4. Implement custom short URL aliases
5. Add analytics and detailed click tracking
6. Implement rate limiting and spam protection