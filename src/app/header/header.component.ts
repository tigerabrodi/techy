import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuth = false;
  userId: string;

  isAuthSubscription: Subscription;

  constructor(private authService: AuthService, private auth: AngularFireAuth) {  }

  ngOnInit(): void {
    this.isAuth = this.authService.isAuth();

    this.isAuthSubscription = this.authService.authChange.subscribe(
      (isAuth) => {
        this.isAuth = isAuth;
      }
    );

    // Get current user id
    this.auth.currentUser
      .then((user) => {
        this.userId = user.uid;
      })
      .catch((err) => console.log(err));


    if (this.isAuth) {

    }
  }

  onClick() {
    const check = document.getElementsByClassName(
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
