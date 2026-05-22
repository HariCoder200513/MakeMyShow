import { create } from 'zustand';

export const useBookingStore = create((set) => ({
  show: null,
  selectedSeats: [],
  seatState: { seats: [], bookedSeatIds: [], lockedSeatIds: [] },
  setShow: (show) => set({ show }),
  setSeatState: (seatState) => set({ seatState }),
  toggleSeat: (seat) => set((state) => {
    const selected = state.selectedSeats.some((item) => item.id === seat.id);
    return {
      selectedSeats: selected
        ? state.selectedSeats.filter((item) => item.id !== seat.id)
        : [...state.selectedSeats, seat]
    };
  }),
  clearSelection: () => set({ selectedSeats: [] })
}));
