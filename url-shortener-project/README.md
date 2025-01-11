# URL Shortener

A simple URL shortener application built with Node.js, Express, and MongoDB.
 This project allows users to input a long URL and receive a shortened version that redirects to the original URL.
 The application also tracks the number of clicks on each shortened URL.

## Table of contents
- featurea
- tecnologies used
- installation
- usage
- how to use
- API Endpoints

## Features

- Shorten long URLs
- Redirect to the original URL when the short URL is accessed
- Track the number of clicks for each shortened URL
- Simple and user-friendly interface

## Technologies Used
*Backend:
- Node.js
- Express.js
*Frontend:
- MongoDB
- Mongoose
- Bootstrap (for styling)
- EJS (Embedded JavaScript templating)
- CSS(for styling)
- ShortID (for generating unique short URLs)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
*Install requried packages
2. install the backend dependencies
   npm install
3. start the backend server
   node server.js
4. install the front-end dependencies
   npm install  

## Usage
start the server
1. npm run dev
2. Open your browser and navigate to `HTTP://localhost:5001`.
3. Enter a long URL in the input field and click the "Shrink" button. The shortened URL will be displayed in the table below.
4. Click on the shortened URL to be redirected to the original URL. The click count will increment each time the short URL is accessed.

## How to use
Enter a URL into the input field and hit Shorten(shrik). The shortened URL will be displayed on the page.
Open the shortened URL in a new tab. It should redirect you to the original URL.

## API Endpoints

POST /short-urls
Request Body: { "fullURL": "http://example.com" }
Description: Creates a new shortened URL.

GET /:shortURL
Description: Redirects to the original URL associated with the provided short URL.
