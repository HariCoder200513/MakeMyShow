import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import toast from 'react-hot-toast';
import TheaterCard from '../components/TheaterCard.jsx';
import { TheaterGridSkeleton } from '../components/Skeletons.jsx';

export default function TheaterSelection() {
  const [theaters, setTheaters] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.get('/theaters', { params: { city } })
        .then(({ data }) => setTheaters(data))
        .catch(() => toast.error('Failed to load theaters'))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [city]);

  return (
    <div className="container-page">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Theaters</h1>
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
      {loading ? <TheaterGridSkeleton /> : (
        <div className="grid gap-4 md:grid-cols-3">{theaters.map((theater) => <TheaterCard key={theater.id} theater={theater} />)}</div>
      )}
    </div>
  );
}
