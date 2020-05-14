import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Alert } from 'src/app/models/alert.model';
import { UiService } from '../ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[];
  alertsSubscription: Subscription;

  constructor(private uiService: UiService) {
    this.alerts = [];
  }

  ngOnInit(): void {
    this.alerts = this.uiService.getAlerts();

    this.alertsSubscription = this.uiService.alertsChanged.subscribe(
      (alerts) => {
        this.alerts = alerts;
      }
    );
  }

  ngOnDestroy() {
    if (this.alertsSubscription) {
      this.alertsSubscription.unsubscribe();
    }
  }
}
