import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import toast from 'react-hot-toast';
import { api } from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';

export default function Signup() {
  const [form, setForm] = useState({ name: '', username: '', email: '', role: 'USER' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const options = await api.post('/auth/register/options', form);
      const registration = await startRegistration({ optionsJSON: options.data });
      const { data } = await api.post('/auth/register/verify', {
        username: form.username,
        registration
      });
      setAuth(data);
      toast.success('Passkey account created');
      navigate(data.user.role === 'OWNER' ? '/owner/theaters' : '/');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Passkey signup failed';
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page grid min-h-[70vh] place-items-center">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Fingerprint className="text-rose-700" size={28} />
          <h1 className="text-2xl font-semibold">Signup with Passkey</h1>
        </div>
        <input className="mt-6 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="USER">User</option>
          <option value="OWNER">Owner</option>
        </select>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="mt-5 w-full rounded-md bg-rose-700 px-4 py-2 text-white disabled:opacity-60">
          {busy ? 'Creating passkey...' : 'Create passkey account'}
        </button>
        <p className="mt-4 text-sm text-slate-600">Have an account? <Link className="text-rose-700" to="/login">Login</Link></p>
      </form>
    </div>
  );
}
