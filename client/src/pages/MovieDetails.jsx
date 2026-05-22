import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import toast from 'react-hot-toast';
import ShowCard from '../components/ShowCard.jsx';
import { MovieDetailsSkeleton, ShowListSkeleton } from '../components/Skeletons.jsx';

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [city, setCity] = useState('');
  const [showsLoading, setShowsLoading] = useState(true);

  useEffect(() => {
    api.get(`/movies/${id}`)
      .then(({ data }) => setMovie(data))
      .catch(() => toast.error('Failed to load movie details'));
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowsLoading(true);
      api.get(`/shows/${id}`, { params: { city } })
        .then(({ data }) => setShows(data))
        .catch(() => toast.error('Failed to load shows'))
        .finally(() => setShowsLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [id, city]);

  if (!movie) return <MovieDetailsSkeleton />;

  return (
    <div className="container-page">
      <section className="grid gap-6 md:grid-cols-[220px_1fr]">
        <img src={movie.posterUrl} alt={movie.title} className="rounded-lg object-cover" />
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">{movie.title}</h1>
          <p className="mt-2 text-slate-600">{movie.description}</p>
          <p className="mt-4 text-sm text-slate-500">{movie.duration} mins • {movie.genre} • {movie.language}</p>
        </div>
      </section>
      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Available Shows</h2>
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Filter city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        {showsLoading ? <ShowListSkeleton /> : (
          <div className="grid gap-3">
            {shows.map((show) => <ShowCard key={show.id} show={show} />)}
          </div>
        )}
      </section>
    </div>
  );
}
