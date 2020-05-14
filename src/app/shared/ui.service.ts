import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Alert } from '../models/alert.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  loadingStateChanged = new Subject<boolean>();

  alertsChanged = new Subject<Alert[]>();
  private alerts: Alert[] = [];

  constructor() {}

  alertAction(message: string, type: string) {
    const id = uuidv4();
    const alert: Alert = {
      message,
      type,
      id,
    };
    this.alerts.unshift(alert);
    this.alertsChanged.next(this.alerts);
    setTimeout(() => {
      this.removeAlert(id);
    }, 2000);
  }

  removeAlert(id: string) {
    this.alerts = this.alerts.filter((alert) => alert.id !== id);
    this.alertsChanged.next(this.alerts.slice());
  }

  getAlerts() {
    return this.alerts;
  }
}
