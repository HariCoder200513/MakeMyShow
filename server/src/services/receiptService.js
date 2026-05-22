import PDFDocument from 'pdfkit';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  }).format(new Date(value));
}

function addRow(doc, label, value, y) {
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#475569').text(label, 56, y);
  doc.font('Helvetica').fontSize(11).fillColor('#111827').text(value || '-', 180, y);
}

export function createReceiptPdf(booking) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks = [];
    const seats = booking.seats.map(({ seat }) => `${seat.row}${seat.number}`).join(', ');
    const qrBase64 = booking.qrCode?.split(',')[1];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, doc.page.width, 110).fill('#9f1239');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text('MakeMyShow', 56, 36);
    doc.font('Helvetica').fontSize(12).text('Movie Ticket Receipt', 56, 68);

    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(18).text(booking.show.movie.title, 56, 145);
    doc.font('Helvetica').fontSize(11).fillColor('#64748b').text(booking.show.movie.genre, 56, 171);

    doc.roundedRect(48, 205, 500, 210, 8).strokeColor('#e2e8f0').stroke();
    addRow(doc, 'Booking ID', booking.id, 232);
    addRow(doc, 'Status', booking.status, 258);
    addRow(doc, 'Theater', booking.show.screen.theater.name, 284);
    addRow(doc, 'City', booking.show.screen.theater.city, 310);
    addRow(doc, 'Screen', booking.show.screen.name, 336);
    addRow(doc, 'Show Time', formatDate(booking.show.startTime), 362);
    addRow(doc, 'Seats', seats, 388);

    doc.roundedRect(48, 445, 500, 118, 8).strokeColor('#e2e8f0').stroke();
    addRow(doc, 'Payment ID', booking.paymentId, 472);
    addRow(doc, 'Booked On', formatDate(booking.createdAt), 498);
    addRow(doc, 'Total Amount', `Rs. ${booking.totalAmount}`, 524);

    if (qrBase64) {
      doc.image(Buffer.from(qrBase64, 'base64'), 386, 142, { width: 130, height: 130 });
      doc.font('Helvetica').fontSize(9).fillColor('#64748b').text('Scan at theater entry', 386, 278, { width: 130, align: 'center' });
    }

    doc.moveTo(56, 610).lineTo(540, 610).strokeColor('#e2e8f0').stroke();
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(
      'Carry a valid ID and arrive before show time. This receipt is valid only for the booking listed above.',
      56,
      632,
      { width: 480 }
    );

    doc.end();
  });
}
