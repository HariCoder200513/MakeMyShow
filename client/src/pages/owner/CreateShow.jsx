import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api/client.js';
import { FormOptionsSkeleton } from '../../components/Skeletons.jsx';

function toDateTimeLocal(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function CreateShow() {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [form, setForm] = useState({ movieId: '', screenId: '', startTime: '', endTime: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const screens = useMemo(() => theaters.flatMap((theater) => theater.screens.map((screen) => ({ ...screen, theaterName: theater.name }))), [theaters]);
  const selectedMovie = useMemo(() => movies.find((movie) => movie.id === form.movieId), [movies, form.movieId]);

  useEffect(() => {
    Promise.all([api.get('/movies'), api.get('/owner/theaters')])
      .then(([moviesResponse, theatersResponse]) => {
        setMovies(moviesResponse.data);
        setTheaters(theatersResponse.data);
      })
      .catch((error) => toast.error(error.response?.data?.error || 'Could not load show data'))
      .finally(() => setLoading(false));
  }, []);

  function updateStartTime(startTime) {
    const next = { ...form, startTime };
    if (startTime && selectedMovie?.duration) {
      next.endTime = toDateTimeLocal(new Date(new Date(startTime).getTime() + selectedMovie.duration * 60_000));
    }
    setForm(next);
  }

  function updateMovie(movieId) {
    const movie = movies.find((item) => item.id === movieId);
    const next = { ...form, movieId };
    if (form.startTime && movie?.duration) {
      next.endTime = toDateTimeLocal(new Date(new Date(form.startTime).getTime() + movie.duration * 60_000));
    }
    setForm(next);
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    if (!form.movieId || !form.screenId || !form.startTime || !form.endTime) {
      toast.error('Select movie, screen, start time, and end time');
      return;
    }
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    setBusy(true);
    try {
      await api.post('/shows', {
        ...form,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });
      toast.success('Show created');
      setForm({ movieId: '', screenId: '', startTime: '', endTime: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not create show');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">Create Show</h1>
      {loading ? <FormOptionsSkeleton /> : <div className="mt-5 grid gap-3 md:grid-cols-2">
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.movieId} onChange={(e) => updateMovie(e.target.value)}>
          <option value="">Select movie</option>
          {movies.map((movie) => <option key={movie.id} value={movie.id}>{movie.title}</option>)}
        </select>
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.screenId} onChange={(e) => setForm({ ...form, screenId: e.target.value })}>
          <option value="">Select screen</option>
          {screens.map((screen) => <option key={screen.id} value={screen.id}>{screen.theaterName} - {screen.name}</option>)}
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2" type="datetime-local" value={form.startTime} onChange={(e) => updateStartTime(e.target.value)} />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
      </div>}
      <button disabled={busy || loading} className="mt-5 rounded-md bg-rose-700 px-4 py-2 text-white disabled:opacity-60">
        {busy ? 'Creating...' : 'Create show'}
      </button>
    </form>
  );
}
