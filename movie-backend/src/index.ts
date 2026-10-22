
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'watchlist_db',
});

// Add this connection test right below your pool creation
pool.getConnection()
  .then(connection => {
    console.log(' Connected to MySQL Database successfully!');
    connection.release();
  })
  .catch(err => {
    console.error(' Database connection failed:', err.message);
  });

const PORT2 = process.env.PORT || 5000;
app.listen(PORT2, () => {
  console.log(`🚀 Server running on port ${PORT2}`);
});

// GET all saved movies
app.get('/api/movies', async (req: Request, res: Response) => {
    try{
        const [rows] = await pool.query('SELECT * FROM movies ORDER BY created_at DESC')
        res.json(rows);
    } catch(error) {
        res.status(500).json({error: 'Failed to fetch movies'});
    }
});

// POST add movie to watchlist or watched
app.post('/api/movies', async (req: Request, res: Response) => {
  const { imdbID, title, year, poster, status } = req.body;

  // Validate that required fields exist before hitting MySQL
  if (!imdbID || !title || !status) {
    console.error('Validation Error: Missing required fields', { imdbID, title, status });
    return res.status(400).json({ error: 'Missing required fields (imdbID, title, status)' });
  }

  try {
    const query = `
      INSERT INTO movies (imdbID, title, year, poster, status) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = ?
    `;
    await pool.query(query, [
      imdbID, 
      title, 
      year ?? '', 
      poster ?? '', 
      status, 
      status
    ]);
    
    res.status(201).json({ message: 'Movie saved successfully' });
  } catch (error: any) {
    console.error('❌ MYSQL INSERT ERROR:', error.message);
    res.status(500).json({ error: 'Failed to save movie', details: error.message });
  }
});

// PUT update status (e.g., from watchlist to watched)
app.put('/api/movies/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE movies SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Movie status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// DELETE movie
app.delete('/api/movies/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM movies WHERE id = ?', [id]);
    res.json({ message: 'Movie deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});