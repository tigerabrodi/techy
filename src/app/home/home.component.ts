import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  isAuth = false;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isAuth = this.authService.isAuth();

    this.authService.authChange.subscribe((auth) => {
      this.isAuth = auth;
    });
  }
}
