
import { CrowdLevel } from '../shared/types';

export class CrowdPredictor {
  private static readonly PEAK_HOURS = [
    { start: '06:00', end: '09:00' },
    { start: '16:00', end: '19:00' }
  ];

  static predictCrowdLevel(historical: CrowdLevel[], location: string, time: Date): number {
    const hour = time.getHours();
    const isPeakHour = this.PEAK_HOURS.some(peak => {
      const [startHour] = peak.start.split(':').map(Number);
      const [endHour] = peak.end.split(':').map(Number);
      return hour >= startHour && hour <= endHour;
    });

    const baseLevel = historical.find(h => h.location === location)?.level || 0;
    const weatherImpact = this.calculateWeatherImpact(time);
    const eventImpact = this.calculateEventImpact(time);
    
    let predictedLevel = baseLevel * (isPeakHour ? 1.5 : 1.0);
    predictedLevel *= weatherImpact;
    predictedLevel *= eventImpact;

    return Math.min(Math.round(predictedLevel), 5);
  }

  private static calculateWeatherImpact(time: Date): number {
    // Implement weather impact calculation
    return 1.0;
  }

  private static calculateEventImpact(time: Date): number {
    // Implement special event impact
    return 1.0;
  }
}
