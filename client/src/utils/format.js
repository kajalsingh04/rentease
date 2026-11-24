// 1500 -> ₹1,500
export const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// 2030-01-01T00:00:00.000Z -> 1 Jan 2030
export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

// indore -> Indore, new delhi -> New Delhi
export const titleCase = (text) => text.replace(/\b\w/g, (c) => c.toUpperCase());

// Tomorrow as YYYY-MM-DD. Used as the first day that can be picked in a date box.
export const tomorrowISO = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const paymentLabel = (method) => (method === 'online' ? 'Online payment' : 'Pay on delivery');

// What happens to the security deposit after the product is returned
export const depositSummary = (rental) => {
  const damage = rental.damageCharge || 0;
  return {
    refund: Math.max(0, rental.securityDeposit - damage), // money to give back to the customer
    extra: Math.max(0, damage - rental.securityDeposit), // damage that is more than the deposit
  };
};