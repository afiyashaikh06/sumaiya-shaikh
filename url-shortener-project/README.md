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
2. Open your browser and navigate to `HTTP://localhost:5001/`.
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

## creating short URL from full URL
 User inputs the full URL into the input field URL on the index page `http://localhost:5001/`. When the form is submitted by clicking the Shrink button, the full URL is sent to the server via a POST request to the "/shorturls" endpoint. The server then creates a new "urls" entity with the full URL and a generated shortened URL. The shortened URL is then displayed on the index page along with the full URL and the number of clicks in table format.

## Conclusion      
     
      In this project, we have created a simple URL shortener using Node.js, Express, MongoDB and Mongoose. 
We have used shortid to generate unique short URLs and EJS to render the front-end. 
We have also implemented basic CRUD operations for the URL model and handled redirection and error cases.
This project demonstrates how to use web development technologies to create a useful and user-friendly application that can shorten long URLs and track their clicks.

Overall, the code provides a good starting point for building a URL shortener web application and can be easily extended and customized to meet specific requirements.
