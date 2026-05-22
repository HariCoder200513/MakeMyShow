import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../api/client.js';

export default function AddMovie() {
  const [form, setForm] = useState({ title: '', description: '', duration: '', genre: '', language: '', posterUrl: '' });
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api.post('/movies', form);
      setForm({ title: '', description: '', duration: '', genre: '', language: '', posterUrl: '' });
      toast.success('Movie saved');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not save movie');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">Add Movie</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {['title', 'duration', 'genre', 'language', 'posterUrl'].map((field) => (
          <input key={field} type={field === 'duration' ? 'number' : 'text'} className="rounded-md border border-slate-300 px-3 py-2" placeholder={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
        ))}
        <textarea className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2" placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <button disabled={busy} className="mt-5 rounded-md bg-rose-700 px-4 py-2 text-white disabled:opacity-60">
        {busy ? 'Saving...' : 'Save movie'}
      </button>
    </form>
  );
}
