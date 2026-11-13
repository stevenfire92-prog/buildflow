// PURGED — legacy Base44 function removed by Steve's order (Nov 13, 2026).
// Payments run through PayPal only. Base44 was canceled Nov 2, 2026; nothing runs this.
export default async function handler() {
  return Response.json({ error: 'gone', payments: 'paypal' }, { status: 410 });
}
