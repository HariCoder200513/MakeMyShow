import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../api/client.js';
import toast from 'react-hot-toast';
import MovieCard from '../components/MovieCard.jsx';
import { MovieGridSkeleton } from '../components/Skeletons.jsx';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState({ search: '', city: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/movies', { params: query });
        setMovies(data);
      } catch (err) {
        toast.error('Failed to load movies');
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="container-page">
      <section className="mb-8 rounded-lg bg-slate-950 p-6 text-white">
        <h1 className="text-3xl font-semibold">Book movie tickets</h1>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="flex items-center gap-2 rounded-md bg-white px-3 text-slate-900">
            <Search size={18} />
            <input className="w-full py-3 outline-none" placeholder="Search movies or genres" value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value })} />
          </label>
          <input className="rounded-md px-3 py-3 text-slate-900" placeholder="City" value={query.city} onChange={(e) => setQuery({ ...query, city: e.target.value })} />
        </div>
      </section>
      {loading ? <MovieGridSkeleton /> : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </div>
      )}
    </div>
  );
}
