# Data Models Documentation

## Overview

The URL Shortener application uses MongoDB with Mongoose ODM for data persistence. This document describes the data models, their schemas, validation rules, and usage patterns.

## URL Model

**File:** `models/shorturl.js`

### Schema Definition

```javascript
const UrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
    default: shortId.generate,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
});
```

### Field Descriptions

| Field   | Type   | Required | Default           | Description |
|---------|--------|----------|-------------------|-------------|
| `full`  | String | Yes      | None              | The original long URL that needs to be shortened |
| `short` | String | Yes      | `shortId.generate` | The generated short identifier for the URL |
| `clicks`| Number | Yes      | `0`               | Counter tracking how many times the short URL has been accessed |

### Field Details

#### `full` Field
- **Purpose:** Stores the original URL that the user wants to shorten
- **Validation:** Required field, must be provided when creating a record
- **Format:** Any string (no URL validation currently implemented)
- **Examples:**
  - `"https://www.example.com/very/long/url/path"`
  - `"http://subdomain.domain.com/page?param=value"`
  - `"https://github.com/user/repository/blob/main/README.md"`

#### `short` Field
- **Purpose:** Stores the unique short identifier for the URL
- **Generation:** Automatically generated using the `shortid` library
- **Uniqueness:** The shortid library generates URL-safe unique identifiers
- **Format:** Alphanumeric string (typically 7-14 characters)
- **Examples:**
  - `"H1fBLN6og"`
  - `"B1x7QN6sx"`
  - `"ryeX7Epjx"`

#### `clicks` Field
- **Purpose:** Tracks the number of times the short URL has been accessed
- **Initialization:** Starts at 0 for new records
- **Updates:** Incremented each time someone accesses the short URL
- **Type:** Integer number

### Model Export

```javascript
module.exports = mongoose.model("urls", UrlSchema);
```

- **Collection Name:** `urls` (MongoDB collection)
- **Model Name:** The exported model can be used throughout the application

## Usage Examples

### Creating a New URL Record

```javascript
const url_model = require("./models/shorturl.js");

// Create a new URL record
const newUrl = await url_model.create({ 
  full: "https://www.example.com/very/long/url" 
});

console.log(newUrl);
// Output:
// {
//   _id: ObjectId("..."),
//   full: "https://www.example.com/very/long/url",
//   short: "H1fBLN6og",
//   clicks: 0,
//   __v: 0
// }
```

### Finding All URL Records

```javascript
// Retrieve all URL records
const allUrls = await url_model.find();

console.log(allUrls);
// Output: Array of all URL documents
```

### Finding a Specific Short URL

```javascript
// Find by short URL identifier
const shortUrl = await url_model.findOne({ short: "H1fBLN6og" });

if (shortUrl) {
  console.log(`Original URL: ${shortUrl.full}`);
  console.log(`Clicks: ${shortUrl.clicks}`);
} else {
  console.log("Short URL not found");
}
```

### Updating Click Count

```javascript
// Find and increment click count
const shortUrl = await url_model.findOne({ short: "H1fBLN6og" });

if (shortUrl) {
  shortUrl.clicks++;
  await shortUrl.save();
  console.log(`Updated clicks: ${shortUrl.clicks}`);
}
```

### Deleting a URL Record

```javascript
// Delete by MongoDB ObjectId
const deletedUrl = await url_model.findOneAndDelete({ 
  _id: "507f1f77bcf86cd799439011" 
});

if (deletedUrl) {
  console.log("URL deleted successfully");
} else {
  console.log("URL not found");
}
```

## Database Operations

### Common Query Patterns

#### 1. Create Operation
```javascript
// Method 1: Using create()
const newUrl = await url_model.create({ full: originalUrl });

// Method 2: Using new + save()
const newUrl = new url_model({ full: originalUrl });
await newUrl.save();
```

#### 2. Read Operations
```javascript
// Find all
const allUrls = await url_model.find();

// Find one by condition
const url = await url_model.findOne({ short: shortId });

// Find by MongoDB ObjectId
const url = await url_model.findById(objectId);
```

#### 3. Update Operations
```javascript
// Update and return updated document
const updatedUrl = await url_model.findOneAndUpdate(
  { short: shortId },
  { $inc: { clicks: 1 } },
  { new: true }
);

// Update using document methods
const url = await url_model.findOne({ short: shortId });
url.clicks++;
await url.save();
```

#### 4. Delete Operations
```javascript
// Delete and return deleted document
const deletedUrl = await url_model.findOneAndDelete({ _id: objectId });

// Delete without returning document
await url_model.deleteOne({ _id: objectId });
```

## Validation Rules

### Current Validation
- `full`: Required field (must be provided)
- `short`: Required field (auto-generated if not provided)
- `clicks`: Required field (defaults to 0)

### Recommended Additional Validation

```javascript
// Enhanced schema with additional validation
const UrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: [true, 'Original URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL starting with http:// or https://'
    }
  },
  short: {
    type: String,
    required: true,
    default: shortId.generate,
    unique: true,
    index: true
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Clicks cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

## Performance Considerations

### Indexing Recommendations

```javascript
// Add indexes for better query performance
UrlSchema.index({ short: 1 }); // Index on short field for fast lookups
UrlSchema.index({ createdAt: -1 }); // Index for sorting by creation date
```

### Query Optimization

1. **Use `findOne()` instead of `find()` when expecting single results**
2. **Use `select()` to limit returned fields when not all data is needed**
3. **Consider using `lean()` for read-only operations**

```javascript
// Optimized queries
const url = await url_model.findOne({ short: shortId }).lean();
const urls = await url_model.find().select('full short clicks').lean();
```

## Error Handling

### Common Errors and Solutions

#### 1. Validation Errors
```javascript
try {
  const newUrl = await url_model.create({ full: "" });
} catch (error) {
  if (error.name === 'ValidationError') {
    console.log('Validation failed:', error.message);
  }
}
```

#### 2. Duplicate Key Errors
```javascript
try {
  const newUrl = await url_model.create({ 
    full: "https://example.com",
    short: "existing-id" 
  });
} catch (error) {
  if (error.code === 11000) {
    console.log('Duplicate short URL identifier');
  }
}
```

#### 3. Cast Errors
```javascript
try {
  const url = await url_model.findById(invalidObjectId);
} catch (error) {
  if (error.name === 'CastError') {
    console.log('Invalid ObjectId format');
  }
}
```

## Future Enhancements

### Recommended Schema Improvements

1. **Add timestamps:**
   ```javascript
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date, default: Date.now }
   ```

2. **Add URL validation:**
   ```javascript
   full: {
     type: String,
     required: true,
     validate: [validator.isURL, 'Please provide a valid URL']
   }
   ```

3. **Add expiration:**
   ```javascript
   expiresAt: { type: Date, index: { expireAfterSeconds: 0 } }
   ```

4. **Add user association:**
   ```javascript
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
   ```

5. **Add analytics:**
   ```javascript
   analytics: [{
     timestamp: Date,
     userAgent: String,
     ip: String,
     referer: String
   }]
   ```