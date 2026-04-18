import { useState, useEffect } from 'react';

interface RLimitDiagramProps {
  resource: string;
  softLimit: number;
  hardLimit: number;
  currentUsage: number;
  isWarning: boolean;
}

/**
 * RLimitDiagram Component - Responsive Version
 * 
 * Visualizes the Unix RLIMIT system architecture with responsive wrapping:
 * User/Shell → Process → Kernel → System Resources
 * 
 * Uses React components instead of fixed SVG to allow dynamic wrapping
 * based on available window space. No horizontal scrolling required.
 */

export default function RLimitDiagram({
  resource,
  softLimit,
  hardLimit,
  currentUsage,
  isWarning,
}: RLimitDiagramProps) {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 800);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const usagePercent = (currentUsage / softLimit) * 100;
  const accentColor = isWarning ? 'text-amber-400' : 'text-cyan-400';
  const accentBg = isWarning ? 'from-amber-500 to-red-500' : 'from-cyan-400 to-cyan-600';
  const accentGlow = isWarning ? 'glow-amber' : 'glow-cyan';

  // Determine layout based on window width
  const isCompact = windowWidth < 768;
  const isMedium = windowWidth < 1024;

  const ArchitectureLayer = ({ title, subtitle, description, icon }: any) => (
    <div className="flex flex-col items-center">
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 min-w-[140px] text-center hover:bg-slate-700 transition-colors">
        <div className="text-xs font-mono text-slate-400 mb-1">{icon}</div>
        <div className="font-semibold text-sm text-slate-100">{title}</div>
        <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
        <div className="text-xs text-slate-500 mt-1">{description}</div>
      </div>
    </div>
  );

  const FlowArrow = ({ direction = 'right' }: any) => {
    const arrowClass = direction === 'right' 
      ? 'after:content-["→"]' 
      : 'after:content-["↓"]';
    
    return (
      <div className={`flex items-center justify-center ${arrowClass} text-cyan-400 text-xl font-bold px-2 py-1 animate-pulse`} />
    );
  };

  return (
    <div className="w-full bg-slate-900/50 rounded-lg border border-slate-700 p-4 space-y-6">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-sm font-mono text-slate-400 mb-2">USER SPACE</h3>
        <div className="h-px bg-gradient-to-r from-slate-600 to-transparent" />
      </div>

      {/* Architecture Flow - Responsive Grid */}
      <div className={`grid gap-3 ${isCompact ? 'grid-cols-1' : isMedium ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <ArchitectureLayer
          icon="🐚"
          title="Shell"
          subtitle="ulimit -n"
          description="Set limits"
        />
        
        {!isCompact && <FlowArrow direction={isMedium ? 'down' : 'right'} />}
        
        <ArchitectureLayer
          icon="⚙️"
          title="Process"
          subtitle={resource}
          description="Inherits limits"
        />
        
        {!isCompact && <FlowArrow direction={isMedium ? 'down' : 'right'} />}
        
        <ArchitectureLayer
          icon="🔧"
          title="Kernel"
          subtitle="getrlimit()"
          description="Enforces limits"
        />
        
        {!isCompact && <FlowArrow direction={isMedium ? 'down' : 'right'} />}
        
        <ArchitectureLayer
          icon="💾"
          title="Resources"
          subtitle="Files, CPU,"
          description="Memory, etc."
        />
      </div>

      {/* Kernel Space Separator */}
      <div className="mt-6 mb-4">
        <h3 className="text-sm font-mono text-slate-400 mb-2">KERNEL SPACE</h3>
        <div className="h-px bg-gradient-to-r from-slate-600 to-transparent" />
      </div>

      {/* Limit Visualization - Responsive Grid */}
      <div className={`grid gap-4 ${isCompact ? 'grid-cols-1' : isMedium ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {/* Soft Limit */}
        <div className="flex flex-col items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="text-xs font-mono text-cyan-400 mb-3 font-semibold">SOFT LIMIT</div>
          
          {/* Circular gauge */}
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="#475569" strokeWidth="6" opacity="0.3" />
              {/* Value circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="6"
                opacity="0.7"
                strokeDasharray="283 283"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-cyan-300">{softLimit}</div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 text-center">
            Active enforcement boundary
          </p>
        </div>

        {/* Hard Limit */}
        <div className="flex flex-col items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="text-xs font-mono text-amber-400 mb-3 font-semibold">HARD LIMIT</div>
          
          {/* Circular gauge */}
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="#475569" strokeWidth="6" opacity="0.3" />
              {/* Value circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="6"
                opacity="0.7"
                strokeDasharray="283 283"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-amber-300">{hardLimit}</div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 text-center">
            Maximum ceiling (root only)
          </p>
        </div>

        {/* Current Usage */}
        <div className="flex flex-col items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className={`text-xs font-mono mb-3 font-semibold ${accentColor}`}>CURRENT USAGE</div>
          
          {/* Circular gauge with usage arc */}
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="#475569" strokeWidth="6" opacity="0.3" />
              {/* Usage arc */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isWarning ? '#f59e0b' : '#06b6d4'}
                strokeWidth="6"
                opacity="0.9"
                strokeDasharray={`${(usagePercent / 100) * 283} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-mono font-bold ${accentColor}`}>
                  {usagePercent.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {currentUsage}/{softLimit}
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 text-center">
            {isWarning ? 'Approaching limit' : 'Within limits'}
          </p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isWarning ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400'}`} />
        <div className="flex-1">
          <div className={`text-sm font-semibold ${isWarning ? 'text-amber-300' : 'text-cyan-300'}`}>
            {isWarning ? '⚠️ WARNING: Approaching Limit' : '✓ Normal Operation'}
          </div>
          <div className="text-xs text-slate-400">
            {isWarning 
              ? 'Resource usage is above 80% of soft limit' 
              : 'Resource usage is within safe limits'}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="grid gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Soft Limit: Active enforcement boundary that processes can modify</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Hard Limit: Maximum ceiling that only root can raise</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Usage: Current resource consumption relative to soft limit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
