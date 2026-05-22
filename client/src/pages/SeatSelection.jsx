import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client.js';
import SeatGrid from '../components/SeatGrid.jsx';
import BookingSummary from '../components/BookingSummary.jsx';
import { SeatSelectionSkeleton } from '../components/Skeletons.jsx';
import { useBookingStore } from '../store/bookingStore.js';
import { createSeatSocket } from '../utils/socket.js';

export default function SeatSelection() {
  const { showId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { selectedSeats, seatState, setSeatState, toggleSeat, clearSelection, setShow, show } = useBookingStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busySeatId, setBusySeatId] = useState('');
  const socket = useMemo(() => createSeatSocket(), []);

  useEffect(() => {
    if (state?.show) setShow(state.show);
    api.get(`/bookings/seats/${showId}`).then(({ data }) => {
      setSeatState(data);
      setLoading(false);
    });
  }, [showId, state, setSeatState, setShow]);

  useEffect(() => {
    if (!socket) return undefined;
    socket.emit('joinShow', { showId });
    socket.on('seatLocked', ({ seatId }) => {
      setSeatState({ ...useBookingStore.getState().seatState, lockedSeatIds: [...new Set([...useBookingStore.getState().seatState.lockedSeatIds, seatId])] });
    });
    socket.on('seatUnlocked', ({ seatId }) => {
      const current = useBookingStore.getState().seatState;
      setSeatState({ ...current, lockedSeatIds: current.lockedSeatIds.filter((id) => id !== seatId) });
    });
    socket.on('seatsBooked', ({ seatIds }) => {
      const current = useBookingStore.getState().seatState;
      setSeatState({ ...current, bookedSeatIds: [...new Set([...current.bookedSeatIds, ...seatIds])] });
    });
    return () => socket.disconnect();
  }, [socket, showId, setSeatState]);

  async function handleSeatClick(seat) {
    if (busySeatId) return;
    setError('');
    setBusySeatId(seat.id);
    const alreadySelected = selectedSeats.some((item) => item.id === seat.id);
    try {
      if (alreadySelected) {
        await api.post('/bookings/unlock', { showId, seatId: seat.id });
        toast.success(`Seat ${seat.row}${seat.number} unlocked`);
      } else if (socket?.connected) {
        await new Promise((resolve, reject) => {
          socket.emit('lockSeat', { showId, seatId: seat.id }, (result) => result?.ok ? resolve() : reject(new Error(result?.error || 'Seat lock failed')));
        });
        toast.success(`Seat ${seat.row}${seat.number} locked`);
      } else {
        await api.post('/bookings/lock', { showId, seatId: seat.id });
        toast.success(`Seat ${seat.row}${seat.number} locked`);
      }
      toggleSeat(seat);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setError(message);
      toast.error(message);
    } finally {
      setBusySeatId('');
    }
  }

  if (loading) return <SeatSelectionSkeleton />;

  return (
    <div className="container-page grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Select Seats</h1>
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <SeatGrid
          seats={seatState.seats}
          bookedSeatIds={seatState.bookedSeatIds}
          lockedSeatIds={seatState.lockedSeatIds}
          selectedSeats={selectedSeats}
          onSeatClick={handleSeatClick}
        />
      </div>
      <div className="space-y-4">
        <BookingSummary show={show || state?.show} seats={selectedSeats} />
        <button
          disabled={!selectedSeats.length}
          className="w-full rounded-md bg-rose-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
          onClick={() => navigate('/checkout', { state: { show: show || state?.show } })}
        >
          Continue
        </button>
        <button className="w-full rounded-md border border-slate-300 px-4 py-3" onClick={clearSelection}>Clear</button>
      </div>
    </div>
  );
}
