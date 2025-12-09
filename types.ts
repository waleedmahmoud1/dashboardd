export enum ProjectName {
  AZZA = 'عزة المتميزة',
  BRONZE = 'برونز عباية',
  MARAYA = 'مرايا عباية',
  SABORIO = 'سابوريو',
}

export enum PlatformName {
  META = 'Meta',
  SNAPCHAT = 'Snapchat',
  TIKTOK = 'TikTok',
  GOOGLE = 'Google Ads',
}

export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  project: ProjectName;
  platform: PlatformName;
  spend: number;
  purchases: number;
}

export enum DateRangeOption {
  TODAY = 'اليوم',
  YESTERDAY = 'أمس',
  LAST_7_DAYS = 'آخر 7 أيام',
  THIS_MONTH = 'هذا الشهر',
  LAST_30_DAYS = 'آخر 30 يوم',
  LAST_3_MONTHS = 'آخر 3 أشهر',
  CUSTOM = 'فترة مخصصة',
}

export interface DateFilterState {
  option: DateRangeOption;
  customStartDate?: string;
  customEndDate?: string;
}

export interface AggregatedStats {
  totalSpend: number;
  totalPurchases: number;
  cpr: number; // Cost Per Result
  bestPlatform: PlatformName | '-';
  highestCostPlatform: PlatformName | '-';
}