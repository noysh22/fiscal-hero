// Fiscal year calculation utilities

export interface FiscalConfig {
  fiscalYearStartMonth: number; // 1-12 (1 = January)
  sprintLengthWeeks: number; // 2, 3, or 4 weeks
  theme: 'cool' | 'corporate'; // Theme selection
  firstSprintDate?: Date; // Optional: First sprint start date
}

export interface FiscalPeriod {
  fiscalYear: number;
  quarter: number;
  sprint: number;
  displayYear: string; // FY2026Q1 format
  sprintCode: string; // 2026.1.3 format
}

export const calculateFiscalPeriod = (config: FiscalConfig, date: Date = new Date()): FiscalPeriod => {
  const currentMonth = date.getMonth() + 1; // 1-12
  const currentYear = date.getFullYear();
  
  // Determine fiscal year
  let fiscalYear: number;
  if (currentMonth >= config.fiscalYearStartMonth) {
    // We're in the fiscal year that started in the current calendar year
    fiscalYear = currentYear + 1;
  } else {
    // We're in the fiscal year that started in the previous calendar year
    fiscalYear = currentYear;
  }
  
  // Calculate which month of the fiscal year we're in (0-11)
  let fiscalMonth: number;
  if (currentMonth >= config.fiscalYearStartMonth) {
    fiscalMonth = currentMonth - config.fiscalYearStartMonth;
  } else {
    fiscalMonth = 12 - config.fiscalYearStartMonth + currentMonth;
  }
  
  // Calculate quarter (1-4)
  const quarter = Math.floor(fiscalMonth / 3) + 1;
  
  // Calculate sprint within quarter based on configurable sprint length
  let sprint: number;

  if (config.firstSprintDate) {
    // Use the configured first sprint date for more accurate calculations
    const firstSprintDate = new Date(config.firstSprintDate);
    const daysDifference = Math.floor((date.getTime() - firstSprintDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksDifference = Math.floor(daysDifference / 7);
    const totalSprintsSinceStart = Math.floor(weeksDifference / config.sprintLengthWeeks);

    // Calculate which sprint within the current quarter
    const sprintsPerQuarter = Math.floor(13 / config.sprintLengthWeeks);
    sprint = (totalSprintsSinceStart % sprintsPerQuarter) + 1;
  } else {
    // Fallback to the original calculation method
    const dayOfMonth = date.getDate();
    const weeksIntoQuarter = Math.floor((fiscalMonth % 3) * 4.33 + (dayOfMonth - 1) / 7);
    sprint = Math.floor(weeksIntoQuarter / config.sprintLengthWeeks) + 1;
  }
  
  // Calculate max sprints per quarter based on sprint length
  const maxSprintsPerQuarter = Math.floor(13 / config.sprintLengthWeeks); // ~13 weeks per quarter
  
  return {
    fiscalYear,
    quarter,
    sprint: Math.min(sprint, maxSprintsPerQuarter),
    displayYear: `FY${fiscalYear} Q${quarter}`,
    sprintCode: `${fiscalYear}.${quarter}.${Math.min(sprint, maxSprintsPerQuarter)}`
  };
};

export const getQuarterProgress = (config: FiscalConfig, date: Date = new Date()): number => {
  const currentMonth = date.getMonth() + 1;
  let fiscalMonth: number;
  
  if (currentMonth >= config.fiscalYearStartMonth) {
    fiscalMonth = currentMonth - config.fiscalYearStartMonth;
  } else {
    fiscalMonth = 12 - config.fiscalYearStartMonth + currentMonth;
  }
  
  const monthInQuarter = fiscalMonth % 3;
  const dayOfMonth = date.getDate();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  
  return (monthInQuarter + dayOfMonth / daysInMonth) / 3;
};