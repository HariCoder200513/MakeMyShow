import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api/client.js';
import { FormOptionsSkeleton } from '../../components/Skeletons.jsx';

export default function AddScreen() {
  const [theaters, setTheaters] = useState([]);
  const [form, setForm] = useState({ theaterId: '', name: '', rows: 5, seatsPerRow: 8, type: 'REGULAR', price: 200 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/owner/theaters')
      .then(({ data }) => setTheaters(data))
      .catch((error) => toast.error(error.response?.data?.error || 'Could not load theaters'))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api.post('/screens', form);
      toast.success('Screen and seats generated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not create screen');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">Add Screen</h1>
      {loading ? <FormOptionsSkeleton /> : <div className="mt-5 grid gap-3 md:grid-cols-2">
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.theaterId} onChange={(e) => setForm({ ...form, theaterId: e.target.value })}>
          <option value="">Select theater</option>
          {theaters.map((theater) => <option key={theater.id} value={theater.id}>{theater.name}</option>)}
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Screen name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" placeholder="Rows" value={form.rows} onChange={(e) => setForm({ ...form, rows: e.target.value })} />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" placeholder="Seats per row" value={form.seatsPerRow} onChange={(e) => setForm({ ...form, seatsPerRow: e.target.value })} />
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="REGULAR">Regular</option><option value="PREMIUM">Premium</option><option value="RECLINER">Recliner</option>
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      </div>}
      <button disabled={busy || loading} className="mt-5 rounded-md bg-rose-700 px-4 py-2 text-white disabled:opacity-60">
        {busy ? 'Generating...' : 'Generate screen'}
      </button>
    </form>
  );
}
