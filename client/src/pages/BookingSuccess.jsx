import { Link, useLocation } from 'react-router-dom';
import { Download } from 'lucide-react';
import { downloadReceipt } from '../utils/downloadReceipt.js';

export default function BookingSuccess() {
  const { state } = useLocation();
  const booking = state?.booking;

  if (!booking) return <div className="container-page">Booking not found.</div>;

  return (
    <div className="container-page grid gap-6 md:grid-cols-[1fr_260px]">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-emerald-700">Booking Confirmed</h1>
        <p className="mt-2 text-slate-600">{booking.show.movie.title} at {booking.show.screen.theater.name}</p>
        <p className="mt-2 text-sm text-slate-500">Seats: {booking.seats.map(({ seat }) => `${seat.row}${seat.number}`).join(', ')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-rose-700 px-4 py-2 text-white"
            onClick={() => downloadReceipt(booking.id)}
          >
            <Download size={18} />
            Download PDF
          </button>
          <Link to="/my-bookings" className="inline-block rounded-md border border-slate-300 px-4 py-2">View bookings</Link>
        </div>
      </section>
      {booking.qrCode && <img src={booking.qrCode} alt="Ticket QR" className="rounded-lg border border-slate-200 bg-white p-4" />}
    </div>
  );
}
