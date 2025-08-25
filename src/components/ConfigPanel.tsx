import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Settings, Calendar } from 'lucide-react';
import { FiscalConfig } from '@/lib/fiscal-year';

interface ConfigPanelProps {
  config: FiscalConfig;
  onConfigChange: (config: FiscalConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const sprintLengths = [
  { value: 2, label: '2 weeks' },
  { value: 3, label: '3 weeks' },
  { value: 4, label: '4 weeks' }
];

const themes = [
  { value: 'cool' as const, label: "I'm cool" },
  { value: 'corporate' as const, label: 'Corporate fluff' }
];

export function ConfigPanel({ config, onConfigChange, isOpen, onToggle }: ConfigPanelProps) {
  const [tempConfig, setTempConfig] = useState(config);

  const handleSave = () => {
    onConfigChange(tempConfig);
    onToggle();
  };

  const handleCancel = () => {
    setTempConfig(config);
    onToggle();
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 cyber-border neon-pulse"
        variant="outline"
        size="sm"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Config Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <Card className="cyber-card w-full max-w-md p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-primary neon-glow">Fiscal Configuration</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fiscal-start" className="text-sm font-medium text-foreground">
                  Fiscal Year Start Date
                </Label>
                <DatePicker
                  date={tempConfig.fiscalYearStartDate}
                  onDateChange={(date) => {
                    if (date) {
                      // Always use current year for the fiscal year start date
                      const currentYear = new Date().getFullYear();
                      const newDate = new Date(currentYear, date.getMonth(), date.getDate());
                      setTempConfig({ ...tempConfig, fiscalYearStartDate: newDate });
                    }
                  }}
                  placeholder="Select fiscal year start date"
                />
                <p className="text-xs text-muted-foreground">
                  The first day of your fiscal year (year will default to current year)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sprint-length" className="text-sm font-medium text-foreground">
                  Sprint Length
                </Label>
                <Select
                  value={tempConfig.sprintLengthWeeks.toString()}
                  onValueChange={(value) => setTempConfig({ ...tempConfig, sprintLengthWeeks: parseInt(value) })}
                >
                  <SelectTrigger className="cyber-border">
                    <SelectValue placeholder="Select sprint length" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    {sprintLengths.map((length) => (
                      <SelectItem
                        key={length.value}
                        value={length.value.toString()}
                        className="text-popover-foreground hover:bg-accent"
                      >
                        {length.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Duration of each sprint in weeks
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first-sprint-date" className="text-sm font-medium text-foreground">
                  First Sprint Date
                </Label>
                <DatePicker
                  date={tempConfig.firstSprintDate}
                  onDateChange={(date) => setTempConfig({ ...tempConfig, firstSprintDate: date })}
                  placeholder="Select first sprint start date"
                  fromMonth={new Date(tempConfig.fiscalYearStartDate.getFullYear(), tempConfig.fiscalYearStartDate.getMonth(), 1)}
                  toMonth={new Date(tempConfig.fiscalYearStartDate.getFullYear() + 1, tempConfig.fiscalYearStartDate.getMonth() + 3, 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Starting date of the first sprint in the fiscal year
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme" className="text-sm font-medium text-foreground">
                  Theme
                </Label>
                <Select
                  value={tempConfig.theme}
                  onValueChange={(value) => setTempConfig({ ...tempConfig, theme: value as 'cool' | 'corporate' })}
                >
                  <SelectTrigger className="cyber-border">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    {themes.map((theme) => (
                      <SelectItem 
                        key={theme.value} 
                        value={theme.value}
                        className="text-popover-foreground hover:bg-accent"
                      >
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Visual appearance style
                </p>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg cyber-border">
                <h3 className="text-sm font-medium text-secondary mb-2">Preview</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Fiscal year starting on <span className="text-primary">{tempConfig.fiscalYearStartDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  Sprint length of <span className="text-primary">{tempConfig.sprintLengthWeeks} weeks</span> = ~{Math.floor(13 / tempConfig.sprintLengthWeeks)} sprints per quarter
                </p>
                {tempConfig.firstSprintDate && (
                  <p className="text-xs text-muted-foreground">
                    First sprint starts on <span className="text-primary">{tempConfig.firstSprintDate.toLocaleDateString('en-GB')}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 cyber-border"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 neon-pulse"
              >
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}