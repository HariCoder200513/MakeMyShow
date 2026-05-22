import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../api/client.js';
import toast from 'react-hot-toast';
import { BookingListSkeleton } from '../components/Skeletons.jsx';
import { downloadReceipt } from '../utils/downloadReceipt.js';

export default function MyBookings() {
  const [bookings, setBookings] = useState(null);

  useEffect(() => {
    api.get('/bookings/my')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Failed to load bookings'));
  }, []);

  if (!bookings) {
    return (
      <div className="container-page">
        <h1 className="mb-5 text-2xl font-semibold">My Bookings</h1>
        <BookingListSkeleton />
      </div>
    );
  }

  return (
    <div className="container-page">
      <h1 className="mb-5 text-2xl font-semibold">My Bookings</h1>
      <div className="grid gap-4">
        {bookings.map((booking) => (
          <article key={booking.id} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-[1fr_160px]">
            <div>
              <h2 className="font-semibold">{booking.show.movie.title}</h2>
              <p className="text-sm text-slate-600">{booking.show.screen.theater.name} • {new Date(booking.show.startTime).toLocaleString()}</p>
              <p className="mt-2 text-sm">Seats: {booking.seats.map(({ seat }) => `${seat.row}${seat.number}`).join(', ')}</p>
              <p className="mt-1 text-sm font-semibold">Rs. {booking.totalAmount}</p>
              <button
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-sm text-white"
                onClick={() => downloadReceipt(booking.id)}
              >
                <Download size={16} />
                PDF Receipt
              </button>
            </div>
            {booking.qrCode && <img src={booking.qrCode} alt="Ticket QR" className="w-36 rounded-md border border-slate-200 p-2" />}
          </article>
        ))}
      </div>
    </div>
  );
}
