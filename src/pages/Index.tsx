import { useState, useEffect } from 'react';
import { FiscalDisplay } from '@/components/FiscalDisplay';
import { ConfigPanel } from '@/components/ConfigPanel';
import { FiscalConfig } from '@/lib/fiscal-year';

const Index = () => {
  const [config, setConfig] = useState<FiscalConfig>({
    fiscalYearStartDate: new Date(new Date().getFullYear(), 6, 28), // Default: July 28th of current year
    sprintLengthWeeks: 3, // Default: 3 weeks
    theme: 'cool' // Default: I'm cool theme
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('fiscal-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);

        // Migration: Handle old fiscalYearStartMonth format
        if (parsedConfig.fiscalYearStartMonth && !parsedConfig.fiscalYearStartDate) {
          // Convert old month-based config to date-based config
          const currentYear = new Date().getFullYear();
          parsedConfig.fiscalYearStartDate = new Date(currentYear, parsedConfig.fiscalYearStartMonth - 1, 1);
          delete parsedConfig.fiscalYearStartMonth; // Remove old property
        }

        // Convert date strings back to Date objects
        if (parsedConfig.fiscalYearStartDate) {
          parsedConfig.fiscalYearStartDate = new Date(parsedConfig.fiscalYearStartDate);
          // Validate the date
          if (isNaN(parsedConfig.fiscalYearStartDate.getTime())) {
            parsedConfig.fiscalYearStartDate = new Date(new Date().getFullYear(), 6, 28); // Default to July 28th
          }
        } else {
          // Ensure we always have a fiscal year start date
          parsedConfig.fiscalYearStartDate = new Date(new Date().getFullYear(), 6, 28); // Default to July 28th
        }

        if (parsedConfig.firstSprintDate) {
          parsedConfig.firstSprintDate = new Date(parsedConfig.firstSprintDate);
          // Validate the date
          if (isNaN(parsedConfig.firstSprintDate.getTime())) {
            delete parsedConfig.firstSprintDate; // Remove invalid date
          }
        }

        // Ensure all required properties exist with defaults
        const validConfig: FiscalConfig = {
          fiscalYearStartDate: parsedConfig.fiscalYearStartDate,
          sprintLengthWeeks: parsedConfig.sprintLengthWeeks || 3,
          theme: parsedConfig.theme || 'cool',
          ...(parsedConfig.firstSprintDate && { firstSprintDate: parsedConfig.firstSprintDate })
        };

        setConfig(validConfig);
      } catch (error) {
        console.error('Error loading saved config:', error);
        // If there's an error parsing, keep the default config
      }
    }
  }, []);

  // Save config to localStorage when it changes
  const handleConfigChange = (newConfig: FiscalConfig) => {
    setConfig(newConfig);
    localStorage.setItem('fiscal-config', JSON.stringify(newConfig));
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newConfig.theme);
  };

  // Apply initial theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', config.theme);
  }, [config.theme]);

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
