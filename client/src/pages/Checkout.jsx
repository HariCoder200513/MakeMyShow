import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client.js';
import BookingSummary from '../components/BookingSummary.jsx';
import PaymentModal from '../components/PaymentModal.jsx';
import { useBookingStore } from '../store/bookingStore.js';

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const selectedSeats = useBookingStore((store) => store.selectedSeats);
  const clearSelection = useBookingStore((store) => store.clearSelection);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const amount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  async function loadRazorpay() {
    if (window.Razorpay) return;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Unable to load Razorpay'));
      document.body.appendChild(script);
    });
  }

  async function pay() {
    setLoading(true);
    setError('');
    try {
      const order = await api.post('/payments/create-order', { amount, currency: 'INR' });
      let paymentId = `pay_mock_${Date.now()}`;
      if (!order.data.mocked) {
        await loadRazorpay();
        const response = await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: order.data.keyId,
          amount: order.data.amount,
          currency: order.data.currency,
          order_id: order.data.id,
          handler: resolve,
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) }
        });
        checkout.open();
      });
        const verified = await api.post('/payments/verify', response);
        paymentId = verified.data.paymentId;
      }
      const { data } = await api.post('/bookings/confirm', {
        showId: state.show.id,
        seatIds: selectedSeats.map((seat) => seat.id),
        paymentId
      });
      clearSelection();
      toast.success('Booking confirmed');
      navigate('/booking-success', { state: { booking: data } });
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Payment failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (!selectedSeats.length) {
    return <div className="container-page rounded-lg border border-slate-200 bg-white p-6">No seats selected.</div>;
  }

  return (
    <div className="container-page grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-2 text-slate-600">Complete payment within the lock window to confirm your seats.</p>
        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="mt-6 rounded-md bg-rose-700 px-4 py-3 font-semibold text-white disabled:opacity-60" onClick={() => setOpen(true)}>Proceed to Pay</button>
      </section>
      <BookingSummary show={state?.show} seats={selectedSeats} />
      <PaymentModal open={open} amount={amount} loading={loading} onClose={() => setOpen(false)} onPay={pay} />
    </div>
  );
}
