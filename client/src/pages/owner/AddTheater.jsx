import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api/client.js';

export default function AddTheater() {
  const [form, setForm] = useState({ name: '', city: '' });
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api.post('/theaters', form);
      setForm({ name: '', city: '' });
      toast.success('Theater saved');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not save theater');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">Add Theater</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      </div>
      <button disabled={busy} className="mt-5 rounded-md bg-rose-700 px-4 py-2 text-white disabled:opacity-60">
        {busy ? 'Saving...' : 'Save theater'}
      </button>
    </form>
  );
}
