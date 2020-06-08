import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestoreDocument,
  AngularFirestore,
} from '@angular/fire/firestore';
import { User } from '../models/user.model';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { UiService } from '../shared/ui.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuth = false;
  userId: string;
  profileId: string;
  isLoading = true;

  private userDoc: AngularFirestoreDocument<User>;
  user: Observable<User>;
  userAvatarObs: Observable<string>;

  isAuthSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private afs: AngularFirestore,
    private router: Router,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    this.isAuth = this.authService.isAuth();

    this.uiService.loadingStateChanged.next(true);

    // Check if the user is authenticated, retrieve his id, get his avatar,
    this.isAuthSubscription = this.authService.authChange.subscribe(
      (isAuth) => {
        if (isAuth) {
          this.isAuth = isAuth;
          // Get current user id
          this.auth.currentUser
            .then((user) => {
              this.userId = user.uid;
              this.userDoc = this.afs.doc<User>(`users/${this.userId}`);
              this.user = this.userDoc.valueChanges();

              this.user.subscribe((user) => {
                this.profileId = user.profileId;
                const ref = this.storage.ref(`images/${this.profileId}`);
                this.userAvatarObs = ref.getDownloadURL();
                this.userAvatarObs.subscribe(() =>
                  this.uiService.loadingStateChanged.next(false)
                );
              });
            })
            .catch((err) => console.log(err));
        } else {
          this.uiService.loadingStateChanged.next(false);
        }
      }
    );

    this.uiService.loadingStateChanged.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  // uncheck to ensure that the navbar goes away, better UX
  onClick() {
    const check = document.getElementsByClassName(
      'nav__checkbox__responsive'
    )[0] as HTMLInputElement;
    check.checked = false;
  }

  uncheckAuthCheckbox() {
    const check = document.getElementsByClassName(
      'nav__checkbox__auth'
    )[0] as HTMLInputElement;
    check.checked = false;
  }

  // Navigate to the users profile
  onNavigateToProfile() {
    this.uncheckAuthCheckbox();
    this.router.navigate([`/profile/:${this.profileId}`]);
  }

  onLogout() {
    this.uncheckAuthCheckbox();
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.isAuthSubscription) {
      this.isAuthSubscription.unsubscribe();
    }
  }
}
