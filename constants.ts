import { PlatformName, ProjectName } from "./types";

export const PROJECTS = [
  ProjectName.AZZA,
  ProjectName.BRONZE,
  ProjectName.MARAYA,
  ProjectName.SABORIO,
];

export const PLATFORMS = [
  PlatformName.META,
  PlatformName.SNAPCHAT,
  PlatformName.TIKTOK,
  PlatformName.GOOGLE,
];

export const PLATFORM_COLORS: Record<PlatformName, string> = {
  [PlatformName.META]: '#3b82f6', // Blue
  [PlatformName.SNAPCHAT]: '#eab308', // Yellow
  [PlatformName.TIKTOK]: '#1f2937', // Dark/Black
  [PlatformName.GOOGLE]: '#22c55e', // Green
};

export const PASTEL_COLORS = [
  '#A7C7E7', // Pastel Blue
  '#C1E1C1', // Pastel Green
  '#FAA0A0', // Pastel Red
  '#B39EB5', // Pastel Purple
  '#FDFD96', // Pastel Yellow
  '#FFB347', // Pastel Orange
];