
import { CrowdLevel } from '../shared/types';

// Kumbh Mela Nashik peak event dates (approx holy dip dates)
const KUMBH_PEAK_DATES: string[] = [
  '2027-07-27', '2027-08-03', '2027-08-10', '2027-08-17',
  '2027-08-24', '2027-09-07', '2027-09-14',
];

// Time-of-day weight profile: index = hour 0-23
const HOUR_WEIGHTS = [
  0.3, 0.25, 0.2, 0.2, 0.4, 0.7,  // 0-5: midnight → early risers
  0.85, 0.9, 0.95, 0.85, 0.75, 0.7, // 6-11: morning peak
  0.65, 0.6, 0.55, 0.5, 0.7, 0.85,  // 12-17: afternoon lull → evening rise
  0.9, 0.95, 0.85, 0.7, 0.55, 0.4,  // 18-23: evening peak → night dispersal
];

// Location-specific hour modifiers (some sites busier in morning, some evening)
const LOCATION_HOUR_BIAS: Record<string, 'morning' | 'evening' | 'balanced'> = {
  'Ramkund': 'morning',
  'Tapovan': 'morning',
  'Kalaram Temple': 'balanced',
  'Godavari Ghat': 'evening',
  'Trimbakeshwar': 'morning',
  'Panchavati': 'evening',
};

export class CrowdPredictor {
  static predictCrowdLevel(historical: CrowdLevel[], location: string, time: Date): number {
    const hour = time.getHours();
    const dateStr = time.toISOString().split('T')[0];

    const baseLevel = historical.find(h => h.location === location)?.level ?? 0;
    if (baseLevel === 0) return 0;

    // 1. Time-of-day weight
    let hourWeight = HOUR_WEIGHTS[hour] ?? 0.5;

    // 2. Apply location-specific bias
    const bias = LOCATION_HOUR_BIAS[location] ?? 'balanced';
    if (bias === 'morning' && hour >= 18) hourWeight *= 0.75;
    if (bias === 'evening' && hour < 10) hourWeight *= 0.8;

    // 3. Day-of-week multiplier (weekends ~20% busier)
    const dow = time.getDay();
    const weekendFactor = dow === 0 || dow === 6 ? 1.2 : 1.0;

    // 4. Kumbh peak date multiplier
    const isPeakDate = KUMBH_PEAK_DATES.includes(dateStr);
    const peakFactor = isPeakDate ? 1.6 : 1.0;

    // 5. Trend smoothing — blend prediction toward base with 0.3 regression
    const rawPrediction = baseLevel * hourWeight * weekendFactor * peakFactor;
    const smoothed = rawPrediction * 0.7 + baseLevel * 0.3;

    return Math.min(5, Math.max(1, Math.round(smoothed)));
  }
}
