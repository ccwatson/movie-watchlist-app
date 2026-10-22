import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './index.css'

interface MovieItem {
  id?: number;
  imdbID: string;
  title?: string;
  year?: string;
  poster?: string;
  status: 'watchlist' | 'watched';
}

const OMDB_APIKEY = '';
const BACKEND_URL = 'http://localhost:5000/api/movies';


function App() {

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<MovieItem[]>([]);
  const [watchedlist, setWatchedlist] = useState<MovieItem[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  //Fetch saved watch lists from backend
  const fetchSavedMovies = async() => {
    try {
      const res = await axios.get(BACKEND_URL);
      setWatchlist(res.data.filter((m: MovieItem) => m.status === 'watchlist'));
      setWatchedlist(res.data.filter((m: MovieItem) => m.status === 'watched'));
    } catch (err) {
      console.error('Error fetching movies', err);
    }
  };

  useEffect(() => {
    fetchSavedMovies();
  }, []);

  // Search OMDB API
  const handleSearch = async(e: React.SyntheticEvent) => {
    e.preventDefault();
    if(!searchTerm.trim()) return;
    try{
      const res = await axios.get(`https://www.omdbapi.com/?apikey=${OMDB_APIKEY}&s=${searchTerm}`);
      if(res.data.Search) {
        setSearchResults(res.data.Search);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching OMDB', err);
    }
  };

  // Add or update movie status in the database
  const saveMovie = async (movie: any, status: 'watchlist' | 'watched') => {
    console.log('Raw movie object from search:', movie); // Let's inspect all available properties
    const payload = {
      imdbID: movie.imdbID || movie.imdbId || movie.id,
      title: movie.Title || movie.title,
      year: movie.Year || movie.year,
      poster: movie.Poster || movie.poster,
      status,
    };

    console.log('Sending movie payload:', payload); // Check browser console to verify fields

    try{
      await axios.post(BACKEND_URL, payload);
      fetchSavedMovies();
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      console.error('Error saving movie', err);
    }
  };

  //Update existing database entry status
  const updateStatus = async(id: number, status: 'watchlist' | 'watched') => {
    try {
      await axios.put(`${BACKEND_URL}/${id}`, { status });
      fetchSavedMovies();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  // Delete movie from database
  const deleteMovie = async(id: number) =>{
    try{
      await axios.delete(`${BACKEND_URL}/${id}`);
      fetchSavedMovies();
    } catch (err) {
      console.error('Error deleting movie', err);
    }
  };

  // Create a movie card based off of movie info
  const renderMovieCard = (movie: MovieItem, showMoveOption = true) => (
    <div key={movie.id || movie.imdbID} className='movie-card' onClick={() => setSelectedMovie(movie)}>
      <img
      src={movie.poster !== 'N/A' ? (movie.poster) : 'https://via.placeholder.com/300x450?text=No+Poster'}
      alt={movie.title}
      />
      <div className="movie-info">
        <div>
          <h4>{movie.title}</h4>
          <p>{movie.year}</p>
        </div>
        <div className="btn-group" onClick={(e) => e.stopPropagation()}>
          {
            showMoveOption && movie.id && (
              <button className="btn-primary" onClick={() => updateStatus(movie.id!, 'watched')}>
                Watched ✓
              </button>
            )
          }
          {
            !showMoveOption && movie.id && (
              <button className="btn-secondary" onClick={() => updateStatus(movie.id!, 'watchlist')}>
                Watchlist ↺
              </button>
            )
          }
          {
            movie.id && (
              <button className="btn-danger" onClick={() => deleteMovie(movie.id!)}>
                ✕
              </button>
            )
          }
        </div>
      </div>
    </div>
  );

  return (
   <div className="app-container">
      <header>
        <h1>CinemaTrack Watchlist</h1>
      </header>

      {/* Search Bar */}
      <form className="search-section" onSubmit={handleSearch}>
        <input 
          type="text"
          placeholder="Search movies or TV shows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {/* Search Results */}
      {
        searchResults.length > 0 && (
          <section>
            <h2>Search Results</h2>
            <div className="search-results">
              {
                searchResults.map((movie) =>(
                    <div key={movie.imdbID} className="movie-card" onClick={() => setSelectedMovie(movie)}>
                      <img 
                      src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                      alt={movie.Title}/>

                      <div className="movie-info"> 
                        <div>
                          <h4>{movie.Title}</h4>
                          <p>{movie.Year} • {movie.Type.toUpperCase()}</p>
                        </div>
                        <div className="btn-group" onClick={(e) => e.stopPropagation() }>
                          <button className="btn-primary" onClick={() => saveMovie(movie, 'watchlist')}>+ Watchlist</button>
                          <button className="btn-secondary" onClick={() => saveMovie(movie, 'watched')}>+ Watched</button>
                        </div>
                      </div>
                    </div>
                ))}
            </div>
          </section>
        )}

        {/* Watchlist Section */}
        <section>
          <h2>Intended to Watch ({watchlist.length})</h2>
          <div className="movie-grid">
            {watchlist.map(movie => renderMovieCard(movie, true))}
          </div>
        </section>

        {/* Watched Section */}
        <section>
          <h2>Watched ({watchedlist.length})</h2>
          <div className="movie-grid">
            {watchedlist.map(movie => renderMovieCard(movie, false))}
          </div>
        </section>

        {/* Detailed Modal */}
        {
          selectedMovie && (
            <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedMovie(null)}>&times;</button>
                <img
                  src={selectedMovie.Poster}
                  alt={selectedMovie.Title}
                  style={{width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '4px'}}
                />
                <h2>{selectedMovie.Title}</h2>
                <p><strong>Release Year: </strong> {selectedMovie.year}</p>
                <p><strong>IMDB ID: </strong> {selectedMovie.imdbID}</p>
                <p><strong>Status </strong> {selectedMovie.status ? selectedMovie.status.toUpperCase() : "SEARCH RESULT"}</p>
              </div>
            </div>
          )}
   </div>
  )
};

export default App
