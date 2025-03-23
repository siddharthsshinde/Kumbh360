
import type { CrowdLevel } from '../shared/types';
import { WebSocket } from 'ws';

export class AlertManager {
  private static readonly THRESHOLD_CRITICAL = 0.9;
  private static readonly THRESHOLD_WARNING = 0.7;

  static checkAndSendAlerts(crowdLevel: CrowdLevel, clients: Set<WebSocket>) {
    const utilizationRate = crowdLevel.currentCount / crowdLevel.capacity;
    
    if (utilizationRate >= this.THRESHOLD_CRITICAL) {
      this.broadcastAlert({
        type: 'emergency',
        location: crowdLevel.location,
        message: `Critical overcrowding at ${crowdLevel.location}. Please avoid this area.`,
        timestamp: new Date().toISOString()
      }, clients);
    } else if (utilizationRate >= this.THRESHOLD_WARNING) {
      this.broadcastAlert({
        type: 'warning',
        location: crowdLevel.location,
        message: `High crowd levels at ${crowdLevel.location}. Consider alternative routes.`,
        timestamp: new Date().toISOString()
      }, clients);
    }
  }

  private static broadcastAlert(alert: any, clients: Set<WebSocket>) {
    const message = JSON.stringify({
      type: 'crowd_alert',
      data: alert
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
