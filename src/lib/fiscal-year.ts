// Fiscal year calculation utilities

export interface FiscalConfig {
  fiscalYearStartDate: Date; // First day of the fiscal year
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
  // Ensure we have a valid fiscal year start date
  const fiscalStartDate = config.fiscalYearStartDate && !isNaN(config.fiscalYearStartDate.getTime())
    ? new Date(config.fiscalYearStartDate)
    : new Date(new Date().getFullYear(), 6, 28); // Default to July 28th
  const currentDate = new Date(date);

  // Determine which fiscal year we're in
  let fiscalYear: number;
  let fiscalYearStartDate: Date;

  // Check if we're in the current fiscal year or the next one
  const currentYearStart = new Date(currentDate.getFullYear(), fiscalStartDate.getMonth(), fiscalStartDate.getDate());

  if (currentDate >= currentYearStart) {
    fiscalYear = currentDate.getFullYear() + 1;
    fiscalYearStartDate = currentYearStart;
  } else {
    fiscalYear = currentDate.getFullYear();
    fiscalYearStartDate = new Date(currentDate.getFullYear() - 1, fiscalStartDate.getMonth(), fiscalStartDate.getDate());
  }

  // Calculate days since fiscal year start
  const daysSinceFiscalStart = Math.floor((currentDate.getTime() - fiscalYearStartDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate quarter (1-4) - each quarter is approximately 91.25 days (365/4)
  // Ensure we handle negative days (before fiscal year start) properly
  const quarter = daysSinceFiscalStart < 0 ? 1 : Math.min(Math.floor(daysSinceFiscalStart / 91.25) + 1, 4);

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
    // Calculate sprint based on weeks since quarter start
    const quarterStartDay = (quarter - 1) * 91.25;
    const daysIntoQuarter = Math.max(0, daysSinceFiscalStart - quarterStartDay);
    const weeksIntoQuarter = Math.floor(daysIntoQuarter / 7);
    sprint = Math.max(1, Math.floor(weeksIntoQuarter / config.sprintLengthWeeks) + 1);
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
  // Ensure we have a valid fiscal year start date
  const fiscalStartDate = config.fiscalYearStartDate && !isNaN(config.fiscalYearStartDate.getTime())
    ? new Date(config.fiscalYearStartDate)
    : new Date(new Date().getFullYear(), 6, 28); // Default to July 28th
  const currentDate = new Date(date);

  // Determine which fiscal year we're in
  let fiscalYearStartDate: Date;

  // Check if we're in the current fiscal year or the next one
  const currentYearStart = new Date(currentDate.getFullYear(), fiscalStartDate.getMonth(), fiscalStartDate.getDate());

  if (currentDate >= currentYearStart) {
    fiscalYearStartDate = currentYearStart;
  } else {
    fiscalYearStartDate = new Date(currentDate.getFullYear() - 1, fiscalStartDate.getMonth(), fiscalStartDate.getDate());
  }

  // Calculate days since fiscal year start
  const daysSinceFiscalStart = Math.floor((currentDate.getTime() - fiscalYearStartDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate which quarter we're in and progress within that quarter
  // Handle negative days (before fiscal year start) properly
  const quarter = daysSinceFiscalStart < 0 ? 1 : Math.min(Math.floor(daysSinceFiscalStart / 91.25) + 1, 4);
  const quarterStartDay = (quarter - 1) * 91.25;
  const daysIntoQuarter = Math.max(0, daysSinceFiscalStart - quarterStartDay);

  // Return progress as a fraction (0-1)
  return Math.min(Math.max(0, daysIntoQuarter / 91.25), 1);
};

export interface QuarterInfo {
  quarter: number;
  startDate: Date;
  endDate: Date;
  displayText: string;
}

export const getAllQuarters = (config: FiscalConfig, date: Date = new Date()): QuarterInfo[] => {
  // Ensure we have a valid fiscal year start date
  const fiscalStartDate = config.fiscalYearStartDate && !isNaN(config.fiscalYearStartDate.getTime())
    ? new Date(config.fiscalYearStartDate)
    : new Date(new Date().getFullYear(), 6, 28); // Default to July 28th
  const currentDate = new Date(date);

  // Determine which fiscal year we're in
  let fiscalYear: number;
  let fiscalYearStartDate: Date;

  // Check if we're in the current fiscal year or the next one
  const currentYearStart = new Date(currentDate.getFullYear(), fiscalStartDate.getMonth(), fiscalStartDate.getDate());

  if (currentDate >= currentYearStart) {
    fiscalYear = currentDate.getFullYear() + 1;
    fiscalYearStartDate = currentYearStart;
  } else {
    fiscalYear = currentDate.getFullYear();
    fiscalYearStartDate = new Date(currentDate.getFullYear() - 1, fiscalStartDate.getMonth(), fiscalStartDate.getDate());
  }

  const quarters: QuarterInfo[] = [];

  for (let quarter = 1; quarter <= 4; quarter++) {
    // Calculate quarter start date (each quarter is approximately 91.25 days)
    const quarterStartDays = (quarter - 1) * 91.25;
    const startDate = new Date(fiscalYearStartDate.getTime() + quarterStartDays * 24 * 60 * 60 * 1000);

    // Calculate quarter end date (day before next quarter starts, or end of fiscal year for Q4)
    let endDate: Date;
    if (quarter === 4) {
      // Q4 ends on the day before next fiscal year starts
      const nextFiscalYearStart = new Date(fiscalYearStartDate.getFullYear() + 1, fiscalYearStartDate.getMonth(), fiscalYearStartDate.getDate());
      endDate = new Date(nextFiscalYearStart.getTime() - 24 * 60 * 60 * 1000);
    } else {
      // Other quarters end the day before next quarter starts
      const nextQuarterStartDays = quarter * 91.25;
      endDate = new Date(fiscalYearStartDate.getTime() + (nextQuarterStartDays - 1) * 24 * 60 * 60 * 1000);
    }

    // Format display text in the requested format: Q1FY25 – July 28, 2024 – October 26, 2024
    const fiscalYearShort = fiscalYear.toString().slice(-2); // Get last 2 digits of fiscal year
    const startDateStr = startDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const endDateStr = endDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    quarters.push({
      quarter,
      startDate,
      endDate,
      displayText: `Q${quarter} FY${fiscalYearShort} – ${startDateStr} – ${endDateStr}`
    });
  }

  return quarters;
};

export interface SprintDates {
  startDate: Date;
  endDate: Date;
}

export const getCurrentSprintDates = (config: FiscalConfig, date: Date = new Date()): SprintDates => {
  const now = new Date(date);
  const sprintLengthWeeks = Math.max(1, Math.floor(config.sprintLengthWeeks || 2));
  const DAY_MS = 24 * 60 * 60 * 1000;
  const SPRINT_MS = sprintLengthWeeks * 7 * DAY_MS;

  // If first sprint date is provided, use it as the anchor for continuous sprints
  if (config.firstSprintDate && !isNaN(new Date(config.firstSprintDate).getTime())) {
    const first = new Date(config.firstSprintDate);
    const msSinceFirst = now.getTime() - first.getTime();

    if (msSinceFirst < 0) {
      // Before first sprint starts, return the first sprint dates
      return {
        startDate: new Date(first),
        endDate: new Date(first.getTime() + SPRINT_MS - DAY_MS)
      };
    }

    const sprintIndex = Math.floor(msSinceFirst / SPRINT_MS);
    const sprintStartMs = first.getTime() + sprintIndex * SPRINT_MS;
    const sprintEndMs = sprintStartMs + SPRINT_MS - DAY_MS; // End of last day of sprint

    return {
      startDate: new Date(sprintStartMs),
      endDate: new Date(sprintEndMs)
    };
  }

  // Fallback: align to current quarter using the same fiscal/quarter math as other utilities
  const fiscalStartDate = config.fiscalYearStartDate && !isNaN(config.fiscalYearStartDate.getTime())
    ? new Date(config.fiscalYearStartDate)
    : new Date(new Date().getFullYear(), 6, 28); // Default July 28th

  const currentYearStart = new Date(now.getFullYear(), fiscalStartDate.getMonth(), fiscalStartDate.getDate());
  const fiscalYearStartDate = now >= currentYearStart
    ? currentYearStart
    : new Date(now.getFullYear() - 1, fiscalStartDate.getMonth(), fiscalStartDate.getDate());

  const msSinceFiscalStart = now.getTime() - fiscalYearStartDate.getTime();
  const QUARTER_MS = 91.25 * DAY_MS;

  const quarter = msSinceFiscalStart < 0 ? 1 : Math.min(Math.floor(msSinceFiscalStart / QUARTER_MS) + 1, 4);
  const quarterStartMs = fiscalYearStartDate.getTime() + (quarter - 1) * QUARTER_MS;

  const msIntoQuarter = Math.max(0, now.getTime() - quarterStartMs);
  const sprintIndexInQuarter = Math.floor(msIntoQuarter / SPRINT_MS);
  const sprintStartMs = quarterStartMs + sprintIndexInQuarter * SPRINT_MS;
  const sprintEndMs = sprintStartMs + SPRINT_MS - DAY_MS; // End of last day of sprint

  return {
    startDate: new Date(sprintStartMs),
    endDate: new Date(sprintEndMs)
  };
};

export const getSprintProgress = (config: FiscalConfig, date: Date = new Date()): number => {
  const now = new Date(date);
  const sprintLengthWeeks = Math.max(1, Math.floor(config.sprintLengthWeeks || 2));
  const DAY_MS = 24 * 60 * 60 * 1000;
  const SPRINT_MS = sprintLengthWeeks * 7 * DAY_MS;

  // If first sprint date is provided, use it as the anchor for continuous sprints
  if (config.firstSprintDate && !isNaN(new Date(config.firstSprintDate).getTime())) {
    const first = new Date(config.firstSprintDate);
    const msSinceFirst = now.getTime() - first.getTime();
    if (msSinceFirst < 0) return 0; // before first sprint start
    const sprintIndex = Math.floor(msSinceFirst / SPRINT_MS);
    const sprintStartMs = first.getTime() + sprintIndex * SPRINT_MS;
    const progress = (now.getTime() - sprintStartMs) / SPRINT_MS;
    return Math.min(Math.max(progress, 0), 1);
  }

  // Fallback: align to current quarter using the same fiscal/quarter math as other utilities
  const fiscalStartDate = config.fiscalYearStartDate && !isNaN(config.fiscalYearStartDate.getTime())
    ? new Date(config.fiscalYearStartDate)
    : new Date(new Date().getFullYear(), 6, 28); // Default July 28th

  const currentYearStart = new Date(now.getFullYear(), fiscalStartDate.getMonth(), fiscalStartDate.getDate());
  const fiscalYearStartDate = now >= currentYearStart
    ? currentYearStart
    : new Date(now.getFullYear() - 1, fiscalStartDate.getMonth(), fiscalStartDate.getDate());

  const msSinceFiscalStart = now.getTime() - fiscalYearStartDate.getTime();
  const QUARTER_MS = 91.25 * DAY_MS;

  const quarter = msSinceFiscalStart < 0 ? 1 : Math.min(Math.floor(msSinceFiscalStart / QUARTER_MS) + 1, 4);
  const quarterStartMs = fiscalYearStartDate.getTime() + (quarter - 1) * QUARTER_MS;

  const msIntoQuarter = Math.max(0, now.getTime() - quarterStartMs);
  const sprintIndexInQuarter = Math.floor(msIntoQuarter / SPRINT_MS);
  const sprintStartMs = quarterStartMs + sprintIndexInQuarter * SPRINT_MS;

  const progress = (now.getTime() - sprintStartMs) / SPRINT_MS;
  return Math.min(Math.max(progress, 0), 1);
};
