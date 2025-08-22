import { useState, useEffect } from 'react';
import { FiscalDisplay } from '@/components/FiscalDisplay';
import { ConfigPanel } from '@/components/ConfigPanel';
import { FiscalConfig } from '@/lib/fiscal-year';

const Index = () => {
  const [config, setConfig] = useState<FiscalConfig>({ 
    fiscalYearStartMonth: 7, // Default: July
    sprintLengthWeeks: 2 // Default: 2 weeks
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('fiscal-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Save config to localStorage when it changes
  const handleConfigChange = (newConfig: FiscalConfig) => {
    setConfig(newConfig);
    localStorage.setItem('fiscal-config', JSON.stringify(newConfig));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-primary neon-glow tracking-wide">
              CORPORATE FISCAL TRACKER
            </h1>
            <p className="text-muted-foreground text-sm tracking-wider uppercase">
              Real-time fiscal period monitoring system
            </p>
          </div>

          {/* Main Display */}
          <FiscalDisplay config={config} />
        </div>
      </div>

      {/* Configuration Panel */}
      <ConfigPanel
        config={config}
        onConfigChange={handleConfigChange}
        isOpen={isConfigOpen}
        onToggle={() => setIsConfigOpen(!isConfigOpen)}
      />
    </div>
  );
};

export default Index;
