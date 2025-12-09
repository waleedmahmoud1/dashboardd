import { DailyEntry, DateRangeOption, DateFilterState, AggregatedStats, PlatformName } from "./types";

// --- Date Helpers (String Based for Stability) ---

export const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isDateInRange = (entryDate: string, filter: DateFilterState): boolean => {
  // entryDate is expected to be YYYY-MM-DD
  const todayStr = getTodayStr();

  switch (filter.option) {
    case DateRangeOption.TODAY:
      return entryDate === todayStr;
      
    case DateRangeOption.YESTERDAY:
      return entryDate === getPastDateStr(1);
      
    case DateRangeOption.LAST_7_DAYS:
      // Inclusive: [Today - 7, Today]
      return entryDate >= getPastDateStr(7) && entryDate <= todayStr;
      
    case DateRangeOption.THIS_MONTH:
      // Check if YYYY-MM matches
      return entryDate.startsWith(todayStr.slice(0, 7));
      
    case DateRangeOption.LAST_30_DAYS:
      return entryDate >= getPastDateStr(30) && entryDate <= todayStr;
      
    case DateRangeOption.LAST_3_MONTHS:
      return entryDate >= getPastDateStr(90) && entryDate <= todayStr;
      
    case DateRangeOption.CUSTOM:
      if (!filter.customStartDate) return true;
      const start = filter.customStartDate;
      // If no end date selected, default to start date (single day selection)
      const end = filter.customEndDate || filter.customStartDate;
      return entryDate >= start && entryDate <= end;
      
    default:
      return true;
  }
};

// --- Calculation Helpers ---

export const calculateStats = (entries: DailyEntry[]): AggregatedStats => {
  if (entries.length === 0) {
    return {
      totalSpend: 0,
      totalPurchases: 0,
      cpr: 0,
      bestPlatform: '-',
      highestCostPlatform: '-',
    };
  }

  const totalSpend = entries.reduce((acc, curr) => acc + curr.spend, 0);
  const totalPurchases = entries.reduce((acc, curr) => acc + curr.purchases, 0);
  const cpr = totalPurchases > 0 ? totalSpend / totalPurchases : 0;

  // Platform breakdown for insights
  const platformStats: Record<string, { spend: number; purchases: number }> = {};
  
  entries.forEach(entry => {
    if (!platformStats[entry.platform]) {
      platformStats[entry.platform] = { spend: 0, purchases: 0 };
    }
    platformStats[entry.platform].spend += entry.spend;
    platformStats[entry.platform].purchases += entry.purchases;
  });

  let bestPlatform: PlatformName | '-' = '-';
  let bestCPR = Infinity;

  let highestCostPlatform: PlatformName | '-' = '-';
  let maxSpend = -1;

  Object.entries(platformStats).forEach(([plat, stats]) => {
    const currentCPR = stats.purchases > 0 ? stats.spend / stats.purchases : Infinity;
    
    // Best platform logic: Lowest CPR (assuming at least 1 purchase)
    if (stats.purchases > 0 && currentCPR < bestCPR) {
      bestCPR = currentCPR;
      bestPlatform = plat as PlatformName;
    }

    // Highest cost platform
    if (stats.spend > maxSpend) {
      maxSpend = stats.spend;
      highestCostPlatform = plat as PlatformName;
    }
  });

  return {
    totalSpend,
    totalPurchases,
    cpr,
    bestPlatform: bestPlatform,
    highestCostPlatform,
  };
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(val);
};

export const formatNumber = (val: number) => {
  return new Intl.NumberFormat('ar-SA').format(val);
};

// --- Export Helpers ---

export const generateCSV = (entries: DailyEntry[]): string => {
  // UTF-8 BOM for Excel to read Arabic correctly
  const BOM = "\uFEFF";
  const headers = ['التاريخ', 'المشروع', 'المنصة', 'الصرف (SAR)', 'الطلبات', 'تكلفة الطلب (CPR)'];
  
  const rows = entries.map(e => {
    const cpr = e.purchases > 0 ? (e.spend / e.purchases).toFixed(2) : '0';
    return [
      e.date,
      e.project,
      e.platform,
      e.spend,
      e.purchases,
      cpr
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\n');
};

export const generateTSV = (entries: DailyEntry[]): string => {
  // TSV is better for direct copy-paste into Google Sheets
  const headers = ['التاريخ', 'المشروع', 'المنصة', 'الصرف', 'الطلبات', 'CPR'];
  
  const rows = entries.map(e => {
    const cpr = e.purchases > 0 ? (e.spend / e.purchases).toFixed(2) : '0';
    return [
      e.date,
      e.project,
      e.platform,
      e.spend,
      e.purchases,
      cpr
    ].join('\t');
  });

  return [headers.join('\t'), ...rows].join('\n');
};