import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { UiService } from '../shared/ui.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  isAuth = false;
  isLoading = true;
  constructor(private authService: AuthService, private uiService: UiService) {}

  ngOnInit(): void {
    this.isAuth = this.authService.isAuth();

    this.authService.authChange.subscribe((auth) => {
      this.isAuth = auth;
    });

    this.uiService.loadingStateChanged.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
}
