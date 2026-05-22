import { useNavigate } from 'react-router-dom';

export default function ShowCard({ show }) {
  const navigate = useNavigate();
  const start = new Date(show.startTime);

  return (
    <button
      onClick={() => navigate(`/shows/${show.id}/seats`, { state: { show } })}
      className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left hover:border-rose-300"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">{show.screen.theater.name}</h3>
          <p className="text-sm text-slate-500">{show.screen.name} • {show.screen.theater.city}</p>
        </div>
        <span className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          {start.toLocaleString()}
        </span>
      </div>
    </button>
  );
}
