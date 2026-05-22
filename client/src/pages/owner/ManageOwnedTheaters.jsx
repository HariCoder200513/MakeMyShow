import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '../../api/client.js';
import { OwnerListSkeleton } from '../../components/Skeletons.jsx';

const emptyMovie = { title: '', description: '', duration: '', genre: '', language: '', posterUrl: '' };
const emptyTheater = { name: '', city: '' };
const emptyScreen = { name: '' };
const emptyShow = { movieId: '', screenId: '', startTime: '', endTime: '' };

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function iconButtonClass(color = 'slate') {
  if (color === 'red') {
    return 'inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50';
  }
  return 'inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50';
}

export default function ManageOwnedTheaters() {
  const [tab, setTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [shows, setShows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const screenOptions = useMemo(() => screens.map((screen) => ({ id: screen.id, label: `${screen.theater.name} - ${screen.name}` })), [screens]);

  async function loadAll() {
    setLoading(true);
    try {
      const [movieRes, theaterRes, screenRes, showRes] = await Promise.all([
        api.get('/movies'),
        api.get('/owner/theaters'),
        api.get('/screens/owner'),
        api.get('/shows/owner/all')
      ]);
      setMovies(movieRes.data);
      setTheaters(theaterRes.data);
      setScreens(screenRes.data);
      setShows(showRes.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not load owner data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function startEdit(type, item) {
    setEditing({ type, id: item.id });
    if (type === 'movie') setForm({ ...emptyMovie, ...item });
    if (type === 'theater') setForm({ name: item.name, city: item.city });
    if (type === 'screen') setForm({ name: item.name });
    if (type === 'show') {
      setForm({
        movieId: item.movieId,
        screenId: item.screenId,
        startTime: toDateTimeLocal(item.startTime),
        endTime: toDateTimeLocal(item.endTime)
      });
    }
  }

  function resetEdit() {
    setEditing(null);
    setForm({});
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (!editing || busy) return;
    setBusy(true);
    try {
      if (editing.type === 'movie') await api.put(`/movies/${editing.id}`, form);
      if (editing.type === 'theater') await api.put(`/theaters/${editing.id}`, form);
      if (editing.type === 'screen') await api.put(`/screens/${editing.id}`, form);
      if (editing.type === 'show') {
        await api.put(`/shows/${editing.id}`, {
          ...form,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString()
        });
      }
      toast.success('Updated');
      resetEdit();
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(type, id) {
    if (busy) return;
    if (!window.confirm(`Delete this ${type}?`)) return;
    setBusy(true);
    try {
      if (type === 'movie') await api.delete(`/movies/${id}`);
      if (type === 'theater') await api.delete(`/theaters/${id}`);
      if (type === 'screen') await api.delete(`/screens/${id}`);
      if (type === 'show') await api.delete(`/shows/${id}`);
      toast.success('Deleted');
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Owner Management</h1>
        <div className="flex rounded-md border border-slate-200 bg-white p-1 text-sm">
          {['movies', 'theaters', 'screens', 'shows'].map((item) => (
            <button
              key={item}
              className={`rounded px-3 py-2 capitalize ${tab === item ? 'bg-rose-700 text-white' : 'text-slate-700'}`}
              onClick={() => {
                setTab(item);
                resetEdit();
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {editing && (
        <form onSubmit={saveEdit} className="mb-5 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold capitalize">Edit {editing.type}</h2>
          {editing.type === 'movie' && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {Object.keys(emptyMovie).map((field) => (
                <input key={field} className="rounded-md border border-slate-300 px-3 py-2" placeholder={field} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
              ))}
            </div>
          )}
          {editing.type === 'theater' && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="City" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
          )}
          {editing.type === 'screen' && (
            <input className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Screen name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          )}
          {editing.type === 'show' && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <select className="rounded-md border border-slate-300 px-3 py-2" value={form.movieId || ''} onChange={(e) => setForm({ ...form, movieId: e.target.value })}>
                {movies.map((movie) => <option key={movie.id} value={movie.id}>{movie.title}</option>)}
              </select>
              <select className="rounded-md border border-slate-300 px-3 py-2" value={form.screenId || ''} onChange={(e) => setForm({ ...form, screenId: e.target.value })}>
                {screenOptions.map((screen) => <option key={screen.id} value={screen.id}>{screen.label}</option>)}
              </select>
              <input className="rounded-md border border-slate-300 px-3 py-2" type="datetime-local" value={form.startTime || ''} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              <input className="rounded-md border border-slate-300 px-3 py-2" type="datetime-local" value={form.endTime || ''} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <button disabled={busy} className="rounded-md bg-rose-700 px-4 py-2 text-white disabled:opacity-60">{busy ? 'Saving...' : 'Save'}</button>
            <button type="button" className="rounded-md border border-slate-300 px-4 py-2" onClick={resetEdit}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <OwnerListSkeleton /> : (
        <>
          {tab === 'movies' && <EntityList items={movies} type="movie" render={(movie) => `${movie.title} - ${movie.language} - ${movie.duration} mins`} onEdit={startEdit} onDelete={deleteItem} />}
          {tab === 'theaters' && <EntityList items={theaters} type="theater" render={(theater) => `${theater.name} - ${theater.city} - ${theater.screens.length} screens`} onEdit={startEdit} onDelete={deleteItem} />}
          {tab === 'screens' && <EntityList items={screens} type="screen" render={(screen) => `${screen.theater.name} - ${screen.name} - ${screen.seats.length} seats - ${screen.shows.length} shows`} onEdit={startEdit} onDelete={deleteItem} />}
          {tab === 'shows' && <EntityList items={shows} type="show" render={(show) => `${show.movie.title} - ${show.screen.theater.name} / ${show.screen.name} - ${new Date(show.startTime).toLocaleString()} - ${show.bookings.length} bookings`} onEdit={startEdit} onDelete={deleteItem} />}
        </>
      )}
    </section>
  );
}

function EntityList({ items, type, render, onEdit, onDelete }) {
  if (!items.length) {
    return <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">No {type}s found.</div>;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-800">{render(item)}</p>
          <div className="flex gap-2">
            <button className={iconButtonClass()} title="Edit" onClick={() => onEdit(type, item)}><Pencil size={16} /></button>
            <button className={iconButtonClass('red')} title="Delete" onClick={() => onDelete(type, item.id)}><Trash2 size={16} /></button>
          </div>
        </article>
      ))}
    </div>
  );
}
