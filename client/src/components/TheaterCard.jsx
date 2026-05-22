export default function TheaterCard({ theater }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-950">{theater.name}</h3>
      <p className="text-sm text-slate-500">{theater.city}</p>
      <p className="mt-2 text-sm text-slate-600">{theater.screens?.length || 0} screens</p>
    </div>
  );
}
