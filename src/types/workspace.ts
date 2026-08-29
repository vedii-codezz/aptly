export type WindowId =
  | "CHECK"
  | "PROFILE"
  | "EXPLORE"
  | "RESUME"
  | "TRACK"
  | "WHY"
  | "IMPROVE"
  | "STRATEGY"
  | "ATS"
  | "SIMULATE"
  | "COMPARE";

export interface WindowState {
  id: WindowId;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  defaultWidth?: number;
  defaultHeight?: number;
}

export type WhyTab =
  | "OVERVIEW"
  | "FIT"
  | "IMPROVE"
  | "STRATEGY"
  | "RESUME"
  | "ATS"
  | "SAMPLES";
