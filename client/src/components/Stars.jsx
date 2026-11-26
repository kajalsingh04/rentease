// Shows a rating from 0 to 5 as stars. Use: <Stars value={4.5} size={16} />
export default function Stars({ value = 0, size = 16 }) {
  const filled = Math.round(value);

  return (
    <span className="inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={n <= filled ? 'text-gold' : 'text-gray-300'}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
        </svg>
      ))}
    </span>
  );
}