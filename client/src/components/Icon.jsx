// Small line icons. Use: <Icon name="cart" size={20} />
const paths = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  rentals: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  returns: (
    <>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  products: (
    <>
      <path d="M20 12 12 20l-9-9V3h8z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  orders: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  maintenance: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-3 3-2.4-.6-.6-2.4z" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20a7 7 0 0 1 14 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 20a7 7 0 0 0-3-5.8" />
    </>
  ),
  claims: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      <path d="M12 8v5M12 16h.01" />
    </>
  ),
  areas: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  check: <path d="m5 12 5 5 9-10" />,
  truck: (
    <>
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  home: (
    <>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  sofa: (
    <>
      <path d="M5 12V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" />
      <rect x="2" y="11" width="4" height="7" rx="1.5" />
      <rect x="18" y="11" width="4" height="7" rx="1.5" />
      <rect x="5" y="14" width="14" height="4" rx="1" />
      <path d="M6 18v2M18 18v2" />
    </>
  ),
  bed: (
    <>
      <path d="M3 19V6M3 14h18v5M21 19v-3a4 4 0 0 0-4-4h-7v2" />
      <circle cx="7" cy="10" r="2" />
    </>
  ),
  table: (
    <>
      <rect x="3" y="7" width="18" height="3" rx="1" />
      <path d="M6 10v9M18 10v9" />
    </>
  ),
  chair: <path d="M7 3h10v9H7zM6 12h12v3H6zM8 15v6M16 15v6" />,
  fridge: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M6 10h12M9 5v3M9 13v4" />
    </>
  ),
  washer: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="14" r="5" />
      <path d="M7 6h2M13 6h4" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}