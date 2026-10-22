CinemaTrack Watchlist App

A full-stack TypeScript application designed to help users search, track, and manage their favorite movies and TV shows. Whether you are building a list of upcoming releases or keeping a log of everything you've already watched, this app provides a seamless cinematic library experience.

Tech Stack -
Frontend: React, Vite, TypeScript, Axios, CSS (Cinematic Dark Theme)
Backend: Node.js, Express, TypeScript, tsx
Database: MySQL
External API: OMDB API

Key Features -
Real-time Search: Query the OMDB database instantly by movie or TV show name.
Dual Categories: Organize titles into Intended to Watch (Watchlist) and Watched lists.
Persistent Storage: Safely save, update, and delete watch list entries backed by a local MySQL database.
Detailed Modal Views: Click any movie card to inspect posters, release years, IMDB IDs, and current status.
Status Management: Easily transition titles between your watchlist and watched history.





Getting Started & Installation

1. Database Setup (MySQL)
Open your MySQL terminal or client and create the database and table:

CREATE DATABASE watchlist_db;
USE watchlist_db;

CREATE TABLE movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imdbID VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  year VARCHAR(20),
  poster VARCHAR(512),
  status ENUM('watchlist', 'watched') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


2. Backend Setup
Navigate to your backend directory and install dependencies:

cd movie-backend
npm install express cors dotenv mysql2
npm install -D typescript ts-node @types/node @types/express @types/cors nodemon tsx


Create a .env file in the root of the backend folder:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=watchlist_db


Start the backend development server:
npm run dev


3. Frontend Setup
Navigate to your frontend directory and install dependencies:
cd movie-frontend
npm install
npm install axios
Open src/App.tsx and ensure your OMDB API key is supplied to OMDB_APIKEY.

Start the frontend development server:
npm run dev
Open your browser and go to the localhost address.



<img width="1239" height="1186" alt="image" src="https://github.com/user-attachments/assets/8c094528-9089-405e-ace2-b9ad8eb6501e" />

<img width="1308" height="1241" alt="image" src="https://github.com/user-attachments/assets/e8dc5658-d2a0-4b92-b841-cce57e26a360" />


<img width="1393" height="1230" alt="image" src="https://github.com/user-attachments/assets/48ddd886-f8d3-4ae1-8373-2fd8fce93555" />


