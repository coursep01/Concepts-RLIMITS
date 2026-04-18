import { useEffect, useRef } from 'react';

interface RLimitDiagramProps {
  resource: string;
  softLimit: number;
  hardLimit: number;
  currentUsage: number;
  isWarning: boolean;
}

/**
 * RLimitDiagram Component
 * 
 * Visualizes the Unix RLIMIT system architecture:
 * User/Shell → Process → Kernel → System Resources
 * 
 * Uses SVG for scalable graphics and animated flow visualization.
 * Cyan (#06b6d4) for active flows, Amber (#f59e0b) for warnings.
 */

export default function RLimitDiagram({
  resource,
  softLimit,
  hardLimit,
  currentUsage,
  isWarning,
}: RLimitDiagramProps) {
  const canvasRef = useRef<SVGSVGElement>(null);

  const usagePercent = (currentUsage / softLimit) * 100;
  const accentColor = isWarning ? '#f59e0b' : '#06b6d4';
  const accentColorLight = isWarning ? '#fbbf24' : '#22d3ee';

  return (
    <div className="w-full bg-slate-900/50 rounded-lg border border-slate-700 p-4 overflow-x-auto">
      <svg
        ref={canvasRef}
        viewBox="0 0 800 500"
        className="w-full min-w-[600px] h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="0.5" opacity="0.3" />
          </pattern>
          
          {/* Gradient for limit rings */}
          <linearGradient id="softGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="hardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="usageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
            <stop offset="100%" stopColor={accentColorLight} stopOpacity="0.8" />
          </linearGradient>

          {/* Animated flow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="800" height="500" fill="#1e293b" />
        <rect width="800" height="500" fill="url(#grid)" />

        {/* Layer Labels */}
        <text x="20" y="30" fontSize="12" fontFamily="IBM Plex Mono" fill="#94a3b8" fontWeight="600">
          USER SPACE
        </text>
        <line x1="20" y1="35" x2="780" y2="35" stroke="#475569" strokeWidth="1" strokeDasharray="5,5" />

        <text x="20" y="150" fontSize="12" fontFamily="IBM Plex Mono" fill="#94a3b8" fontWeight="600">
          KERNEL SPACE
        </text>
        <line x1="20" y1="155" x2="780" y2="155" stroke="#475569" strokeWidth="1" strokeDasharray="5,5" />

        {/* USER/SHELL LAYER */}
        <g>
          <rect x="50" y="50" width="120" height="80" rx="6" fill="#334155" stroke="#475569" strokeWidth="2" />
          <text x="110" y="75" fontSize="14" fontFamily="Roboto" fontWeight="600" fill="#e2e8f0" textAnchor="middle">
            Shell
          </text>
          <text x="110" y="95" fontSize="11" fontFamily="IBM Plex Mono" fill="#cbd5e1" textAnchor="middle">
            ulimit -n
          </text>
          <text x="110" y="110" fontSize="10" fontFamily="Roboto" fill="#94a3b8" textAnchor="middle">
            Set limits
          </text>
        </g>

        {/* PROCESS LAYER */}
        <g>
          <rect x="250" y="50" width="140" height="80" rx="6" fill="#334155" stroke="#475569" strokeWidth="2" />
          <text x="320" y="75" fontSize="14" fontFamily="Roboto" fontWeight="600" fill="#e2e8f0" textAnchor="middle">
            Process
          </text>
          <text x="320" y="95" fontSize="11" fontFamily="IBM Plex Mono" fill="#cbd5e1" textAnchor="middle">
            {resource}
          </text>
          <text x="320" y="110" fontSize="10" fontFamily="Roboto" fill="#94a3b8" textAnchor="middle">
            Inherits limits
          </text>
        </g>

        {/* KERNEL LAYER */}
        <g>
          <rect x="450" y="50" width="140" height="80" rx="6" fill="#334155" stroke="#475569" strokeWidth="2" />
          <text x="520" y="75" fontSize="14" fontFamily="Roboto" fontWeight="600" fill="#e2e8f0" textAnchor="middle">
            Kernel
          </text>
          <text x="520" y="95" fontSize="11" fontFamily="IBM Plex Mono" fill="#cbd5e1" textAnchor="middle">
            getrlimit()
          </text>
          <text x="520" y="110" fontSize="10" fontFamily="Roboto" fill="#94a3b8" textAnchor="middle">
            Enforces limits
          </text>
        </g>

        {/* SYSTEM RESOURCES */}
        <g>
          <rect x="650" y="50" width="120" height="80" rx="6" fill="#334155" stroke="#475569" strokeWidth="2" />
          <text x="710" y="75" fontSize="14" fontFamily="Roboto" fontWeight="600" fill="#e2e8f0" textAnchor="middle">
            Resources
          </text>
          <text x="710" y="95" fontSize="11" fontFamily="IBM Plex Mono" fill="#cbd5e1" textAnchor="middle">
            Files, CPU,
          </text>
          <text x="710" y="110" fontSize="10" fontFamily="IBM Plex Mono" fill="#cbd5e1" textAnchor="middle">
            Memory, etc.
          </text>
        </g>

        {/* Flow Arrows */}
        <g stroke={accentColor} strokeWidth="2" fill="none" filter="url(#glow)">
          {/* Shell → Process */}
          <path d="M 170 90 Q 210 90 250 90" strokeDasharray="5,5" className="animate-flow" />
          <polygon points="250,90 240,85 240,95" fill={accentColor} />

          {/* Process → Kernel */}
          <path d="M 390 90 Q 420 90 450 90" strokeDasharray="5,5" className="animate-flow" />
          <polygon points="450,90 440,85 440,95" fill={accentColor} />

          {/* Kernel → Resources */}
          <path d="M 590 90 Q 620 90 650 90" strokeDasharray="5,5" className="animate-flow" />
          <polygon points="650,90 640,85 640,95" fill={accentColor} />
        </g>

        {/* LIMIT VISUALIZATION SECTION */}
        <g>
          {/* Soft Limit Ring */}
          <g>
            <text x="110" y="220" fontSize="12" fontFamily="Roboto" fontWeight="600" fill="#06b6d4" textAnchor="middle">
              Soft Limit
            </text>
            <circle cx="110" cy="280" r="50" fill="none" stroke="url(#softGradient)" strokeWidth="3" opacity="0.7" />
            <circle cx="110" cy="280" r="50" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.3" />
            <text x="110" y="285" fontSize="16" fontFamily="IBM Plex Mono" fontWeight="700" fill="#22d3ee" textAnchor="middle">
              {softLimit}
            </text>
          </g>

          {/* Hard Limit Ring */}
          <g>
            <text x="320" y="220" fontSize="12" fontFamily="Roboto" fontWeight="600" fill="#f59e0b" textAnchor="middle">
              Hard Limit
            </text>
            <circle cx="320" cy="280" r="50" fill="none" stroke="url(#hardGradient)" strokeWidth="3" opacity="0.7" />
            <circle cx="320" cy="280" r="50" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.3" />
            <text x="320" y="285" fontSize="16" fontFamily="IBM Plex Mono" fontWeight="700" fill="#fbbf24" textAnchor="middle">
              {hardLimit}
            </text>
          </g>

          {/* Current Usage Gauge */}
          <g>
            <text x="530" y="220" fontSize="12" fontFamily="Roboto" fontWeight="600" fill={accentColor} textAnchor="middle">
              Current Usage
            </text>
            
            {/* Background circle */}
            <circle cx="530" cy="280" r="50" fill="none" stroke="#475569" strokeWidth="8" opacity="0.5" />
            
            {/* Usage arc */}
            <circle
              cx="530"
              cy="280"
              r="50"
              fill="none"
              stroke="url(#usageGradient)"
              strokeWidth="8"
              strokeDasharray={`${(usagePercent / 100) * 314.159} 314.159`}
              strokeLinecap="round"
              transform="rotate(-90 530 280)"
              opacity="0.9"
            />
            
            <text x="530" y="280" fontSize="18" fontFamily="IBM Plex Mono" fontWeight="700" fill={accentColorLight} textAnchor="middle" dominantBaseline="middle">
              {usagePercent.toFixed(0)}%
            </text>
            <text x="530" y="305" fontSize="12" fontFamily="IBM Plex Mono" fill="#cbd5e1" textAnchor="middle">
              {currentUsage}/{softLimit}
            </text>
          </g>

          {/* Status Indicator */}
          <g>
            <rect x="680" y="240" width="100" height="80" rx="4" fill="#334155" stroke={accentColor} strokeWidth="1" opacity="0.5" />
            <circle cx="730" cy="260" r="6" fill={isWarning ? '#f59e0b' : '#06b6d4'} />
            <text x="745" y="265" fontSize="12" fontFamily="Roboto" fontWeight="600" fill={isWarning ? '#fbbf24' : '#22d3ee'}>
              {isWarning ? 'WARNING' : 'NORMAL'}
            </text>
            <text x="730" y="295" fontSize="11" fontFamily="Roboto" fill="#cbd5e1" textAnchor="middle">
              {isWarning ? 'Approaching limit' : 'Within limits'}
            </text>
          </g>
        </g>

        {/* Bottom Legend */}
        <g>
          <text x="50" y="450" fontSize="11" fontFamily="Roboto" fill="#94a3b8">
            ▬ Soft Limit: Active enforcement boundary
          </text>
          <text x="350" y="450" fontSize="11" fontFamily="Roboto" fill="#94a3b8">
            ▬ Hard Limit: Maximum ceiling (root only)
          </text>
          <text x="680" y="450" fontSize="11" fontFamily="Roboto" fill="#94a3b8">
            ▬ Usage: Current resource consumption
          </text>
        </g>
      </svg>
    </div>
  );
}
