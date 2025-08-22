import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { calculateFiscalPeriod, getQuarterProgress, FiscalConfig, FiscalPeriod } from '@/lib/fiscal-year';

interface FiscalDisplayProps {
  config: FiscalConfig;
}

export function FiscalDisplay({ config }: FiscalDisplayProps) {
  const [fiscalData, setFiscalData] = useState<FiscalPeriod | null>(null);
  const [quarterProgress, setQuarterProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateData = () => {
      const now = new Date();
      setCurrentTime(now);
      setFiscalData(calculateFiscalPeriod(config, now));
      setQuarterProgress(getQuarterProgress(config, now));
    };

    updateData();
    const interval = setInterval(updateData, 1000); // Update every second for real-time feel

    return () => clearInterval(interval);
  }, [config]);

  if (!fiscalData) return null;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Background scan lines effect */}
      <div className="absolute inset-0 scan-lines opacity-20"></div>
      
      <Card className="cyber-card relative overflow-hidden p-8 md:p-12">
        {/* Main Display */}
        <div className="text-center space-y-6">
          {/* Fiscal Year Display */}
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-bold hologram tracking-wider">
              {fiscalData.displayYear}
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent neon-pulse"></div>
          </div>

          {/* Sprint Code */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground tracking-widest uppercase">Sprint Identifier</p>
            <h2 className="text-2xl md:text-4xl font-mono text-primary neon-glow">
              {fiscalData.sprintCode}
            </h2>
          </div>

          {/* Quarter Progress Bar */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground tracking-widest uppercase">Quarter Progress</p>
            <div className="relative w-full max-w-md mx-auto">
              <div className="h-2 bg-muted rounded-full overflow-hidden cyber-border">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                  style={{ width: `${quarterProgress * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-center mt-2 font-mono">
                {(quarterProgress * 100).toFixed(1)}% Complete
              </p>
            </div>
          </div>

          {/* Current Time */}
          <div className="pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2">Time of day</p>
            <p className="font-mono text-lg text-secondary neon-glow-purple">
              {currentTime.toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZoneName: 'short'
              })}
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-3 h-3 bg-primary rounded-full animate-neon-pulse"></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full animate-hologram-flicker"></div>
        <div className="absolute bottom-4 left-4 w-2 h-2 bg-secondary rounded-full animate-neon-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-4 right-4 w-3 h-3 bg-neon-pink rounded-full animate-hologram-flicker" style={{animationDelay: '1s'}}></div>
      </Card>
    </div>
  );
}