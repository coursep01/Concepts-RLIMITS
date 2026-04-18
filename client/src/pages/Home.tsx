import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Info } from 'lucide-react';
import RLimitDiagram from '@/components/RLimitDiagram';

/**
 * Home Page - Interactive RLIMIT Diagram
 * 
 * Design Philosophy: System Architecture Visualization
 * - Hierarchical layout: User/Shell → Process → Kernel → Resources
 * - Cyan accents (#06b6d4) for active flows
 * - Amber (#f59e0b) for warnings/exceeded limits
 * - Deep slate background (#1e293b) for technical authority
 * - Interactive cards and animated flow visualization
 */

export default function Home() {
  const [selectedResource, setSelectedResource] = useState('RLIMIT_NOFILE');
  const [softLimit, setSoftLimit] = useState(1024);
  const [hardLimit, setHardLimit] = useState(65536);
  const [currentUsage, setCurrentUsage] = useState(256);

  const resources = [
    {
      name: 'RLIMIT_NOFILE',
      description: 'Maximum number of open file descriptors',
      default: { soft: 1024, hard: 65536 },
      warning: 'Too many open files',
    },
    {
      name: 'RLIMIT_CPU',
      description: 'Maximum CPU time in seconds',
      default: { soft: 'unlimited', hard: 'unlimited' },
      warning: 'CPU time limit exceeded',
    },
    {
      name: 'RLIMIT_DATA',
      description: 'Maximum size of process data segment (heap)',
      default: { soft: 'unlimited', hard: 'unlimited' },
      warning: 'Memory allocation failed',
    },
    {
      name: 'RLIMIT_STACK',
      description: 'Maximum size of process stack',
      default: { soft: '8MB', hard: 'unlimited' },
      warning: 'Stack overflow (SIGSEGV)',
    },
    {
      name: 'RLIMIT_CORE',
      description: 'Maximum size of core dump file',
      default: { soft: 0, hard: 'unlimited' },
      warning: 'Core dump truncated',
    },
    {
      name: 'RLIMIT_NPROC',
      description: 'Maximum number of processes per user',
      default: { soft: 4096, hard: 4096 },
      warning: 'Cannot fork new process',
    },
  ];

  const currentResource = resources.find(r => r.name === selectedResource);
  const usagePercent = (currentUsage / softLimit) * 100;
  const isWarning = usagePercent > 80;

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">RLIMIT Explorer</h1>
              <p className="text-sm text-muted-foreground">Interactive visualization of Unix resource limits</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Resource Selection */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                Resources
              </h2>
              <div className="space-y-2">
                {resources.map((resource) => (
                  <button
                    key={resource.name}
                    onClick={() => setSelectedResource(resource.name)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedResource === resource.name
                        ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                        : 'hover:bg-slate-700/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="font-mono text-xs font-semibold">{resource.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {resource.description}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Diagram Section */}
            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-semibold mb-4">System Architecture</h2>
              <RLimitDiagram
                resource={selectedResource}
                softLimit={softLimit}
                hardLimit={hardLimit}
                currentUsage={currentUsage}
                isWarning={isWarning}
              />
            </Card>

            {/* Interactive Controls */}
            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-semibold mb-6">Limit Configuration</h2>
              
              <div className="space-y-6">
                {/* Current Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Current Usage</label>
                    <span className={`text-sm font-mono ${isWarning ? 'text-amber-400 glow-amber' : 'text-cyan-400 glow-cyan'}`}>
                      {currentUsage} / {softLimit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isWarning
                          ? 'bg-gradient-to-r from-amber-500 to-red-500'
                          : 'bg-gradient-to-r from-cyan-400 to-cyan-600'
                      }`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {usagePercent.toFixed(1)}% of soft limit
                  </p>
                </div>

                {/* Soft Limit Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium">Soft Limit</label>
                    <span className="text-sm font-mono text-cyan-400 glow-cyan">{softLimit}</span>
                  </div>
                  <Slider
                    value={[softLimit]}
                    onValueChange={(value) => setSoftLimit(value[0])}
                    min={100}
                    max={hardLimit}
                    step={100}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    The value currently enforced by the kernel. Can be changed by the process up to the hard limit.
                  </p>
                </div>

                {/* Hard Limit Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium">Hard Limit</label>
                    <span className="text-sm font-mono text-amber-400 glow-amber">{hardLimit}</span>
                  </div>
                  <Slider
                    value={[hardLimit]}
                    onValueChange={(value) => setHardLimit(Math.max(value[0], softLimit))}
                    min={softLimit}
                    max={100000}
                    step={100}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    The ceiling for the soft limit. Only root can raise this value.
                  </p>
                </div>

                {/* Usage Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium">Simulate Usage</label>
                    <span className="text-sm font-mono text-slate-400">{currentUsage}</span>
                  </div>
                  <Slider
                    value={[currentUsage]}
                    onValueChange={(value) => setCurrentUsage(value[0])}
                    min={0}
                    max={softLimit * 1.2}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Adjust to see how the system responds as limits are approached.
                  </p>
                </div>
              </div>
            </Card>

            {/* Resource Details */}
            {currentResource && (
              <Card className="bg-card border-border p-6">
                <h2 className="text-xl font-semibold mb-4">{currentResource.name}</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-cyan-400 mb-1">Description</h3>
                    <p className="text-sm text-muted-foreground">{currentResource.description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-cyan-400 mb-1">Default Limits</h3>
                    <div className="text-sm font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Soft:</span>
                        <span className="text-foreground">{currentResource.default.soft}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hard:</span>
                        <span className="text-foreground">{currentResource.default.hard}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-amber-400 mb-1">When Exceeded</h3>
                    <p className="text-sm text-muted-foreground">{currentResource.warning}</p>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      View limits with: <code className="bg-slate-700 px-2 py-1 rounded text-cyan-300">ulimit -a</code>
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Info Section */}
        <Card className="bg-card border-border p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4">Understanding Soft vs Hard Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 mb-2">Soft Limit</h3>
              <p className="text-sm text-muted-foreground">
                The value currently enforced by the kernel for the process. A process can change its soft limit to any value up to the hard limit. This is the active limit that matters for day-to-day operation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-400 mb-2">Hard Limit</h3>
              <p className="text-sm text-muted-foreground">
                Acts as a ceiling for the soft limit. An unprivileged process can lower the hard limit but cannot raise it. Only the root user can raise hard limits. This provides a safety boundary.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
