import { api } from '../api/client.js';
import toast from 'react-hot-toast';

export async function downloadReceipt(bookingId) {
  try {
    const response = await api.get(`/bookings/${bookingId}/receipt`, {
      responseType: 'blob'
    });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${bookingId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('PDF receipt downloaded');
  } catch (error) {
    toast.error(error.response?.data?.error || 'Could not download receipt');
  }
}
