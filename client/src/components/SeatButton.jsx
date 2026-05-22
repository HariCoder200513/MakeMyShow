export default function SeatButton({ seat, selected, locked, booked, onClick }) {
  const disabled = booked || locked;
  const className = booked
    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
    : locked
      ? 'bg-amber-200 text-amber-900 cursor-not-allowed'
      : selected
        ? 'bg-rose-700 text-white'
        : 'bg-white text-slate-800 hover:border-rose-400';

  return (
    <button
      disabled={disabled}
      onClick={() => onClick(seat)}
      className={`h-10 rounded-md border border-slate-300 text-xs font-semibold ${className}`}
      title={`${seat.row}${seat.number} ${seat.type}`}
    >
      {seat.row}{seat.number}
    </button>
  );
}
