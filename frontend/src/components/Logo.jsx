/** MessageX app icon — blue rounded square with a white speech bubble. */
export default function Logo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mx-logo-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5bb6ff" />
          <stop offset="1" stopColor="#0a72ff" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#mx-logo-g)" />
      <path
        d="M24 11.5c-7.5 0-13.5 4.9-13.5 10.9 0 3.4 1.9 6.5 5 8.5-.2 1.7-.9 3.2-2.1 4.5-.4.4 0 1.1.6 1 2.6-.2 4.9-1.1 6.5-2.4 1.2.3 2.4.4 3.5.4 7.5 0 13.5-4.9 13.5-10.9S31.5 11.5 24 11.5Z"
        fill="#fff"
      />
    </svg>
  );
}
