export type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "error";

const PATTERNS: Record<HapticStyle, number[]> = {
  light: [10],
  medium: [20],
  heavy: [40],
  success: [10, 50, 10],
  warning: [30, 40, 30],
  error: [50, 60, 50, 60, 50],
};

export function useHaptics() {
  const trigger = (style: HapticStyle = "light") => {
    if (!("vibrate" in navigator)) return;
    try {
      navigator.vibrate(PATTERNS[style]);
    } catch {
      // silently ignore
    }
  };

  return { trigger };
}
