export default function AppIcon({ size = 30, className = "" }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ef6a36", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#d45a2a", stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="courtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#252422", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#1a1917", stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="chatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#f7f7f7", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#e5e5e5", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Main background circle */}
      <circle cx="100" cy="100" r="95" fill="url(#bgGradient)" stroke="#ffffff" strokeWidth="3" />

      {/* Sports court (basketball court representation) */}
      <rect x="35" y="60" width="60" height="80" rx="8" fill="url(#courtGradient)" stroke="#ffffff" strokeWidth="2" />

      {/* Court center circle */}
      <circle cx="65" cy="100" r="15" fill="none" stroke="#ffffff" strokeWidth="2" />

      {/* Court basket hoops */}
      <rect x="33" y="75" width="4" height="15" fill="#ffffff" />
      <rect x="33" y="110" width="4" height="15" fill="#ffffff" />
      <rect x="93" y="75" width="4" height="15" fill="#ffffff" />
      <rect x="93" y="110" width="4" height="15" fill="#ffffff" />

      {/* AI Chat bubble */}
      <path
        d="M 110 45 Q 165 45 165 75 Q 165 105 110 105 L 95 105 L 105 120 L 110 105 Q 110 75 110 45 Z"
        fill="url(#chatGradient)"
        stroke="#252422"
        strokeWidth="2"
      />

      {/* AI brain/circuit pattern in chat bubble */}
      <circle cx="137.5" cy="75" r="3" fill="#252422" />
      <circle cx="125" cy="65" r="2" fill="#252422" />
      <circle cx="150" cy="65" r="2" fill="#252422" />
      <circle cx="125" cy="85" r="2" fill="#252422" />
      <circle cx="150" cy="85" r="2" fill="#252422" />

      {/* Connection lines for AI pattern */}
      <line x1="137.5" y1="75" x2="125" y2="65" stroke="#252422" strokeWidth="1" />
      <line x1="137.5" y1="75" x2="150" y2="65" stroke="#252422" strokeWidth="1" />
      <line x1="137.5" y1="75" x2="125" y2="85" stroke="#252422" strokeWidth="1" />
      <line x1="137.5" y1="75" x2="150" y2="85" stroke="#252422" strokeWidth="1" />

      {/* Sports elements */}
      {/* Basketball */}
      <circle cx="130" cy="130" r="12" fill="#ef6a36" stroke="#252422" strokeWidth="1" />
      <path d="M 118 130 Q 130 120 142 130" stroke="#252422" strokeWidth="1" fill="none" />
      <path d="M 118 130 Q 130 140 142 130" stroke="#252422" strokeWidth="1" fill="none" />
      <line x1="130" y1="118" x2="130" y2="142" stroke="#252422" strokeWidth="1" />

      {/* Tennis racket */}
      <ellipse cx="55" cy="155" rx="8" ry="12" fill="none" stroke="#252422" strokeWidth="2" />
      <rect x="53" y="167" width="4" height="15" fill="#ef6a36" />
      <line x1="50" y1="150" x2="60" y2="160" stroke="#252422" strokeWidth="1" />
      <line x1="55" y1="145" x2="55" y2="165" stroke="#252422" strokeWidth="1" />

      {/* Booking/Calendar icon */}
      <rect x="150" y="150" width="20" height="18" rx="2" fill="#ffffff" stroke="#252422" strokeWidth="1" />
      <line x1="153" y1="147" x2="153" y2="153" stroke="#252422" strokeWidth="2" />
      <line x1="167" y1="147" x2="167" y2="153" stroke="#252422" strokeWidth="2" />
      <line x1="152" y1="156" x2="168" y2="156" stroke="#f7f7f7" strokeWidth="1" />
      <line x1="152" y1="160" x2="168" y2="160" stroke="#f7f7f7" strokeWidth="1" />
      <line x1="152" y1="164" x2="168" y2="164" stroke="#f7f7f7" strokeWidth="1" />

      {/* Connecting elements (representing booking/chat flow) */}
      <path d="M 95 100 Q 115 115 130 130" stroke="#f7f7f7" strokeWidth="2" fill="none" strokeDasharray="3,3" />
      <path d="M 130 130 Q 140 140 150 155" stroke="#f7f7f7" strokeWidth="2" fill="none" strokeDasharray="3,3" />
    </svg>
  );
}
