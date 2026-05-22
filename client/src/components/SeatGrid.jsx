import SeatButton from './SeatButton.jsx';

export default function SeatGrid({ seats, bookedSeatIds, lockedSeatIds, selectedSeats, onSeatClick }) {
  const selected = new Set(selectedSeats.map((seat) => seat.id));
  const booked = new Set(bookedSeatIds);
  const locked = new Set(lockedSeatIds);
  const rows = seats.reduce((acc, seat) => {
    acc[seat.row] = [...(acc[seat.row] || []), seat];
    return acc;
  }, {});

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-6 rounded-md bg-slate-900 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white">Screen</div>
      <div className="space-y-3">
        {Object.entries(rows).map(([row, rowSeats]) => (
          <div key={row} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${rowSeats.length}, minmax(40px, 1fr))` }}>
            {rowSeats.map((seat) => (
              <SeatButton
                key={seat.id}
                seat={seat}
                selected={selected.has(seat.id)}
                booked={booked.has(seat.id)}
                locked={locked.has(seat.id) && !selected.has(seat.id)}
                onClick={onSeatClick}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-600">
        <span>White available</span><span>Red selected</span><span>Amber locked</span><span>Gray booked</span>
      </div>
    </div>
  );
}
