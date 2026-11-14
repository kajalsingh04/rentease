// 1500 -> ₹1,500
export const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
// 2030-01-01T00:00:00.000Z -> 1 Jan 2030
export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';