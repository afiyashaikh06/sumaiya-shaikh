# Frontend Documentation

## Overview

The URL Shortener frontend is a web-based interface built with EJS templating, Bootstrap CSS framework, and custom styling. It provides a simple, user-friendly interface for creating, viewing, and managing shortened URLs.

**File:** `views/index.ejs`

## Technology Stack

### Frontend Technologies
- **Template Engine:** EJS (Embedded JavaScript)
- **CSS Framework:** Bootstrap 5.3.0
- **Custom Styling:** Inline CSS and custom styles
- **Icons/UI:** Bootstrap components and styling
- **Responsive Design:** Bootstrap grid system

## Page Structure

### HTML Document Structure

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Meta tags and Bootstrap CSS -->
  </head>
  <body>
    <div class="container">
      <!-- Application content -->
    </div>
  </body>
</html>
```

### Main Sections
1. **Header Section:** Page title and branding
2. **Input Section:** URL submission form
3. **Display Section:** Table of existing shortened URLs

## Components Documentation

### 1. Page Header

```html
<h1>URL Shortener</h1>
```

**Component:** Main Page Title
- **Purpose:** Displays the application name and primary heading
- **Styling:** Default Bootstrap h1 styling with custom color (white)
- **Position:** Top of the page within container

### 2. URL Input Form

```html
<form action="/shorturls" method="POST" class="my-4 forminline">
  <label for="fullUrl" class="visually-hidden">URL</label>
  <div class="input-group mb-3">
    <input
      placeholder="URL"
      type="url"
      name="fullUrl"
      id="fullUrl"
      class="form-control col mr-2"
    />
    <button class="btn btn-success" type="submit">Shrink</button>
  </div>
</form>
```

**Component:** URL Submission Form

**Form Attributes:**
- **Action:** `/shorturls` (POST endpoint)
- **Method:** `POST`
- **Classes:** `my-4 forminline` (Bootstrap margin classes)

**Input Field:**
- **Type:** `url` (HTML5 URL input type)
- **Name:** `fullUrl` (matches server expectation)
- **ID:** `fullUrl`
- **Placeholder:** "URL"
- **Classes:** `form-control col mr-2` (Bootstrap form styling)
- **Validation:** HTML5 URL validation

**Submit Button:**
- **Type:** `submit`
- **Classes:** `btn btn-success` (Bootstrap green button)
- **Text:** "Shrink"
- **Hover Effect:** Custom hover color (`#085524`)

**Accessibility:**
- Label with `visually-hidden` class for screen readers
- Proper form associations with `for` attribute

### 3. URL Display Table

```html
<table class="table align-middle table-striped table-hover table-responsive table-bordered border-secondary table-sm">
  <thead class="table-dark">
    <tr>
      <th>Full URL</th>
      <th>Short URL</th>
      <th>Clicks</th>
      <th>Delete URL</th>
    </tr>
  </thead>
  <tbody>
    <!-- Dynamic content rendered via EJS -->
  </tbody>
</table>
```

**Component:** URL Management Table

**Table Classes:**
- `table`: Base Bootstrap table
- `align-middle`: Vertical alignment
- `table-striped`: Alternating row colors
- `table-hover`: Hover effects on rows
- `table-responsive`: Mobile responsive behavior
- `table-bordered`: Border around table
- `border-secondary`: Secondary border color
- `table-sm`: Compact table size

**Table Structure:**
- **Header:** Dark themed (`table-dark`)
- **Columns:** Full URL, Short URL, Clicks, Delete Action
- **Body:** Dynamically populated with EJS

### 4. Dynamic Table Rows

```html
<% shorturls.forEach(shorturl => { %>
<tr>
  <td><a href="<%= shorturl.full %>"><%= shorturl.full %></a></td>
  <td><a href="<%= shorturl.short %>"><%= shorturl.short %></a></td>
  <td><%= shorturl.clicks %></td>
  <td>
    <form method="POST" action="/<%= shorturl._id %>">
      <input type="hidden" name="_method" value="DELETE" />
      <button class="btn btn-danger" type="submit">Delete</button>
    </form>
  </td>
</tr>
<% }) %>
```

**Component:** Dynamic Table Rows (EJS Template)

**EJS Logic:**
- **Loop:** `shorturls.forEach()` iterates through URL data
- **Data Binding:** Server data rendered into HTML

**Column Details:**

#### Full URL Column
- **Content:** Clickable link to original URL
- **Link Target:** External URL (`shorturl.full`)
- **Display:** Full URL text

#### Short URL Column
- **Content:** Clickable link to short URL
- **Link Target:** Local short URL (`shorturl.short`)
- **Display:** Short identifier

#### Clicks Column
- **Content:** Click counter display
- **Data:** Numeric value (`shorturl.clicks`)
- **Format:** Plain text number

#### Delete Column
- **Content:** Delete form with button
- **Form Action:** `/<%= shorturl._id %>` (DELETE endpoint)
- **Method Override:** Hidden input with `_method="DELETE"`
- **Button:** Red danger button (`btn btn-danger`)

## Styling and Design

### Custom CSS Styles

```css
body {
  margin: 10;
  font-family: Arial, sans-serif;
  background-color: #010b22;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  display: flex;
  align-items: center;
}

#shorten-btn:hover {
  background-color: #085524;
}

.table tr td:nth-of-type(3){
  text-align: left;
  color:#fff;
}
```

**Style Breakdown:**

#### Body Styles
- **Background:** Dark blue (`#010b22`)
- **Text Color:** White (`#fff`)
- **Font:** Arial, sans-serif
- **Layout:** Flexbox centering
- **Height:** Full viewport height (`100vh`)

#### Button Hover Effects
- **Target:** Shorten button hover state
- **Color:** Dark green (`#085524`)

#### Table Cell Styling
- **Target:** Third column (clicks column)
- **Alignment:** Left-aligned text
- **Color:** White text

### Bootstrap Integration

**Bootstrap CDN:**
```html
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ"
  crossorigin="anonymous"
/>
```

**Bootstrap Components Used:**
- Container layout system
- Form controls and input groups
- Button components
- Table components with various modifiers
- Utility classes for spacing and alignment

## User Interactions

### 1. URL Submission Flow

**User Action:** Enter URL and click "Shrink"
1. User types URL in input field
2. HTML5 validation checks URL format
3. Form submits via POST to `/shorturls`
4. Server processes and redirects back to homepage
5. Page reloads showing new shortened URL in table

**Validation:**
- HTML5 `type="url"` provides client-side validation
- Browser shows error for invalid URL formats
- Required field validation (implicit)

### 2. URL Navigation

**User Action:** Click on URLs in table
1. **Full URL Link:** Opens original website in same tab
2. **Short URL Link:** Redirects through application to original URL
3. Click tracking occurs server-side during redirect

### 3. URL Deletion

**User Action:** Click "Delete" button
1. User clicks red "Delete" button
2. Form submits POST request to `/:id` endpoint
3. Server deletes record and redirects to homepage
4. Page reloads without deleted URL

## Responsive Design

### Mobile Responsiveness

**Bootstrap Classes:**
- `table-responsive`: Horizontal scrolling on small screens
- `container`: Responsive container with appropriate margins
- `input-group`: Responsive form layout

**Viewport Configuration:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Screen Size Considerations

**Large Screens:**
- Full table display with all columns visible
- Centered layout with appropriate margins

**Medium Screens:**
- Table remains functional with Bootstrap responsive classes
- Form maintains proper proportions

**Small Screens:**
- Horizontal scrolling for table
- Stacked form elements where appropriate
- Maintained readability and functionality

## Accessibility Features

### Current Accessibility

1. **Semantic HTML:** Proper use of form, table, and heading elements
2. **Labels:** Visually hidden label for screen readers
3. **Form Associations:** Proper `for` and `id` attributes
4. **Alt Text:** Not applicable (no images)
5. **Keyboard Navigation:** Standard HTML form and link navigation

### Accessibility Improvements Needed

```html
<!-- Enhanced accessibility -->
<form action="/shorturls" method="POST" class="my-4" role="form">
  <label for="fullUrl" class="visually-hidden">Enter URL to shorten</label>
  <div class="input-group mb-3">
    <input
      placeholder="Enter URL to shorten"
      type="url"
      name="fullUrl"
      id="fullUrl"
      class="form-control"
      aria-describedby="url-help"
      required
      aria-label="URL to shorten"
    />
    <button class="btn btn-success" type="submit" aria-label="Shorten URL">
      Shrink
    </button>
  </div>
  <div id="url-help" class="form-text visually-hidden">
    Enter a valid URL starting with http:// or https://
  </div>
</form>

<table class="table align-middle table-striped table-hover table-responsive table-bordered border-secondary table-sm" role="table" aria-label="Shortened URLs">
  <thead class="table-dark">
    <tr role="row">
      <th scope="col">Full URL</th>
      <th scope="col">Short URL</th>
      <th scope="col">Clicks</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    <!-- Enhanced table rows with proper ARIA attributes -->
  </tbody>
</table>
```

## Performance Considerations

### Current Performance Issues

1. **Inline Styles:** CSS embedded in HTML increases page size
2. **No Minification:** Bootstrap loaded from CDN without optimization
3. **No Caching:** No cache headers for static assets
4. **Full Page Reloads:** Every action requires full page refresh

### Performance Improvements

```html
<!-- Optimized external stylesheet -->
<link rel="stylesheet" href="/styles/main.css">

<!-- Minified Bootstrap -->
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-..."
  crossorigin="anonymous"
>

<!-- Preload critical resources -->
<link rel="preload" href="/styles/main.css" as="style">
```

## Browser Compatibility

### Supported Browsers
- **Modern Browsers:** Chrome, Firefox, Safari, Edge (latest versions)
- **HTML5 Support:** Required for URL input type validation
- **CSS3 Support:** Required for flexbox and modern styling
- **JavaScript:** Not required for basic functionality

### Fallbacks
- HTML5 URL input falls back to text input in older browsers
- Bootstrap provides cross-browser compatibility
- Flexbox has good modern browser support

## Error Handling

### Client-Side Error Handling

**Current Error Handling:**
- HTML5 form validation for URL format
- Browser-native error messages

**Enhanced Error Handling:**
```html
<div id="error-message" class="alert alert-danger d-none" role="alert">
  Please enter a valid URL starting with http:// or https://
</div>

<script>
document.querySelector('form').addEventListener('submit', function(e) {
  const input = document.querySelector('#fullUrl');
  const errorDiv = document.querySelector('#error-message');
  
  if (!input.validity.valid) {
    e.preventDefault();
    errorDiv.classList.remove('d-none');
    input.focus();
  } else {
    errorDiv.classList.add('d-none');
  }
});
</script>
```

## Future Enhancements

### UI/UX Improvements

1. **AJAX Submissions:** Avoid full page reloads
2. **Loading States:** Show progress during operations
3. **Success Messages:** Confirm successful operations
4. **Copy to Clipboard:** Easy copying of short URLs
5. **Bulk Operations:** Select and delete multiple URLs
6. **Search/Filter:** Find specific URLs in large lists
7. **Pagination:** Handle large numbers of URLs
8. **Dark/Light Mode Toggle:** User preference support

### Enhanced Features

```html
<!-- Copy to clipboard functionality -->
<button class="btn btn-outline-secondary btn-sm" onclick="copyToClipboard('<%= shorturl.short %>')">
  <i class="bi bi-clipboard"></i> Copy
</button>

<!-- Search functionality -->
<div class="mb-3">
  <input type="text" class="form-control" placeholder="Search URLs..." id="search-input">
</div>

<!-- Bulk actions -->
<div class="mb-3">
  <button class="btn btn-danger" id="delete-selected" disabled>Delete Selected</button>
</div>
```

### Progressive Web App Features

1. **Service Worker:** Offline functionality
2. **App Manifest:** Install as mobile app
3. **Push Notifications:** URL expiration alerts
4. **Local Storage:** Cache frequently accessed URLs