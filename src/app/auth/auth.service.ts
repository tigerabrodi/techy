import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthData } from '../models/auth-data.model';
import { Router } from '@angular/router';
import { UiService } from '../shared/ui.service';
import { Subject } from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authChange = new Subject<boolean>();
  private isAuthenticated = false;
  private userId: string;

  private usersCollection: AngularFirestoreCollection<User>;
  constructor(
    public auth: AngularFireAuth,
    private router: Router,
    private uiService: UiService,
    private afs: AngularFirestore
  ) {
    // current user id
    this.auth.currentUser
      .then((user) => {
        this.userId = user.uid;
      })
      .catch((err) => console.log(err.message));

    this.usersCollection = this.afs.collection<User>('users');
  }

  initAuthListener() {
    this.auth.authState.subscribe((user) => {
      if (user) {
        this.authChange.next(true);
        this.isAuthenticated = true;
        this.userId = user.uid;
      } else {
        this.authChange.next(false);
        this.isAuthenticated = false;
      }
    });
  }

  // setTimeout is used to prevent the user from seeing the auth page after succeded by keep loading a while.
  registerUser(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.auth
      .createUserWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        this.router.navigate(['/profile/new']);
        this.usersCollection.doc(result.user.uid).set(null);
        setTimeout(() => {
          this.uiService.loadingStateChanged.next(false);
        }, 300);
      })
      .catch((error) => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.alertAction(error.message, 'danger');
      });
  }

  login(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.auth
      .signInWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        setTimeout(() => {
          this.uiService.loadingStateChanged.next(false);
        }, 300);
      })
      .catch((error) => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.alertAction(error.message, 'danger');
      });
  }

  logout() {
    this.auth.signOut();
  }

  isAuth() {
    return this.isAuthenticated;
  }
}
