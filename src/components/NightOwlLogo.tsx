import React from 'react';

interface NightOwlLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const NightOwlLogo: React.FC<NightOwlLogoProps> = ({
  className = '',
  size = 32,
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-900/80 via-slate-900 to-slate-950 p-1.5 shadow-md shadow-violet-950/30 ring-1 ring-violet-500/20 shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-violet-200"
        >
          {/* Owl Outer Geometric Crest */}
          <path
            d="M6 10L10 6L14 9H18L22 6L26 10V22C26 25.3137 23.3137 28 20 28H12C8.68629 28 6 25.3137 6 22V10Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle Wing Contours */}
          <path
            d="M6.5 15.5C9.5 17.5 11 21.5 11.5 27.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          <path
            d="M25.5 15.5C22.5 17.5 21 21.5 20.5 27.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          {/* Nocturnal Cyan Eyes with Subtle Rim */}
          <circle cx="11.5" cy="15.5" r="3" fill="#06B6D4" fillOpacity="0.2" stroke="#22D3EE" strokeWidth="1.4" />
          <circle cx="11.5" cy="15.5" r="1.1" fill="#F0FDFA" />
          <circle cx="20.5" cy="15.5" r="3" fill="#06B6D4" fillOpacity="0.2" stroke="#22D3EE" strokeWidth="1.4" />
          <circle cx="20.5" cy="15.5" r="1.1" fill="#F0FDFA" />
          {/* Geometric Beak */}
          <path
            d="M16 17.5L14.7 20.8H17.3L16 17.5Z"
            fill="#F59E0B"
          />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col select-none">
          <span className="font-display font-bold text-sm sm:text-base tracking-tight text-white leading-none">
            NightOwl<span className="text-violet-400">.ai</span>
          </span>
          <span className="text-[9px] text-slate-400 tracking-wider uppercase font-mono mt-0.5">
            Privacy Chat Intel
          </span>
        </div>
      )}
    </div>
  );
};
