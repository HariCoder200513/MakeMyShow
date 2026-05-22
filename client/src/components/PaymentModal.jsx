export default function PaymentModal({ open, onPay, onClose, amount, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-950">Confirm Payment</h2>
        <p className="mt-2 text-sm text-slate-600">Pay Rs. {amount} using Razorpay test mode.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-md border border-slate-300 px-4 py-2" onClick={onClose}>Cancel</button>
          <button disabled={loading} className="rounded-md bg-rose-700 px-4 py-2 text-white disabled:opacity-60" onClick={onPay}>
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
