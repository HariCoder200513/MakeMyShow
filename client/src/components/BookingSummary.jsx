export default function BookingSummary({ show, seats }) {
  const total = seats.reduce((sum, seat) => sum + seat.price, 0);
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-950">Booking Summary</h2>
      {show && <p className="mt-2 text-sm text-slate-600">{show.movie?.title} • {new Date(show.startTime).toLocaleString()}</p>}
      <div className="mt-4 space-y-2 text-sm">
        {seats.map((seat) => (
          <div key={seat.id} className="flex justify-between">
            <span>{seat.row}{seat.number} ({seat.type})</span>
            <span>Rs. {seat.price}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 font-semibold">
        <span>Total</span>
        <span>Rs. {total}</span>
      </div>
    </aside>
  );
}
