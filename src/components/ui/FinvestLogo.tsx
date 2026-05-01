// Finvest SVG logo — icon + wordmark.
// Accepts a `size` prop (icon height in px, defaults to 28).
// Clicking the logo navigates to /dashboard.

import { Link } from '@tanstack/react-router';

interface FinvestLogoProps {
  size?: number;
}

export const FinvestLogo = ({ size = 28 }: FinvestLogoProps) => {
  const textSize = Math.round(size * 0.6);
  const gap = Math.round(size * 0.32);

  return (
    <Link to="/dashboard" className="flex items-center" style={{ gap }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Ring gradient — darker green→cyan */}
          <linearGradient id="fv-ring" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          {/* Bars gradient — lighter green→cyan */}
          <linearGradient id="fv-bars" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#a5f3fc" />
          </linearGradient>
          <clipPath id="fv-clip">
            <circle cx="50" cy="50" r="44" />
          </clipPath>
        </defs>

        {/* Circular ring with 4 gaps */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="url(#fv-ring)"
          strokeWidth="6"
          fill="none"
          strokeDasharray="58 12 58 12 58 12 58 12"
        />

        {/* Ascending bars, clipped to circle */}
        <g clipPath="url(#fv-clip)" fill="url(#fv-bars)">
          <rect x="22" y="58" width="9" height="20" rx="2" />
          <rect x="34" y="48" width="9" height="30" rx="2" />
          <rect x="46" y="38" width="9" height="40" rx="2" />
          <rect x="58" y="28" width="9" height="50" rx="2" />
        </g>

        {/* Dot */}
        <circle cx="26" cy="48" r="4.5" fill="url(#fv-bars)" />
      </svg>

      <span
        className="font-semibold leading-none tracking-tight text-slate-100"
        style={{ fontSize: textSize }}
      >
        Finvest
      </span>
    </Link>
  );
};
