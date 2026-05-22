import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.id}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-rose-300">
      <img src={movie.posterUrl} alt={movie.title} className="aspect-[2/3] w-full object-cover" />
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-950">{movie.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{movie.genre} • {movie.language}</p>
      </div>
    </Link>
  );
}
