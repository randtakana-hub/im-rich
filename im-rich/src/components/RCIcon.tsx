export function RCIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  const id = "rc-" + size;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Rich Coin"
      role="img"
    >
      <defs>
        <radialGradient id={`${id}-face`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FBE3AE" />
          <stop offset="35%" stopColor="#F0B95A" />
          <stop offset="70%" stopColor="#D9A441" />
          <stop offset="100%" stopColor="#9C6C20" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F7D08A" />
          <stop offset="50%" stopColor="#9C6C20" />
          <stop offset="100%" stopColor="#F0B95A" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id}-rim)`} />
      <circle cx="50" cy="50" r="41" fill={`url(#${id}-face)`} stroke="#8A5F1E" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#8A5F1E" strokeWidth="1" strokeDasharray="2.2 2.6" opacity="0.55" />
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="30"
        fill="#4A2F0C"
        opacity="0.85"
      >
        RC
      </text>
    </svg>
  );
}

/** Larger animated hero variant — idle float + a slow diagonal shine sweep. */
export function RCCoinHero({ size = 280 }: { size?: number }) {
  return (
    <div className="relative animate-coin-float" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-3xl" />
      <div className="relative h-full w-full overflow-hidden rounded-full">
        <RCIcon size={size} className="h-full w-full drop-shadow-[0_20px_45px_rgba(217,164,65,0.35)]" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <div className="absolute -inset-y-10 -left-1/2 w-1/3 animate-coin-shine bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}
