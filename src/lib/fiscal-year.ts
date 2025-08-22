// Fiscal year calculation utilities

export interface FiscalConfig {
  fiscalYearStartMonth: number; // 1-12 (1 = January)
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
  
  // Calculate sprint within quarter (1-6, assuming 2-week sprints in 3-month quarters)
  const dayOfMonth = date.getDate();
  const weeksIntoQuarter = Math.floor((fiscalMonth % 3) * 4.33 + (dayOfMonth - 1) / 7);
  const sprint = Math.floor(weeksIntoQuarter / 2) + 1;
  
  return {
    fiscalYear,
    quarter,
    sprint: Math.min(sprint, 6), // Cap at 6 sprints per quarter
    displayYear: `FY${fiscalYear}Q${quarter}`,
    sprintCode: `${fiscalYear}.${quarter}.${Math.min(sprint, 6)}`
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