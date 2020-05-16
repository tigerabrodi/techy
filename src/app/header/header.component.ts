import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuth = false;

  isAuthSubscription: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isAuth = this.authService.isAuth();

    this.isAuthSubscription = this.authService.authChange.subscribe(
      (isAuth) => {
        this.isAuth = isAuth;
      }
    );
  }

  onClick() {
    let check = document.getElementsByClassName(
      'checkbox'
    )[0] as HTMLInputElement;
    check.checked = false;
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.isAuthSubscription) {
      this.isAuthSubscription.unsubscribe();
    }
  }
}
