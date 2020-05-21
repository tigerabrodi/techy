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
    // current users unique id
    this.auth.currentUser
      .then((user) => {
        this.userId = user.uid;
      })
      .catch((err) => console.log(err.message));

    // users collection
    this.usersCollection = this.afs.collection<User>('users');
  }
  // Function which fires in the app component to check if the user is authenticated
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

  // register user
  registerUser(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.auth
      .createUserWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        this.router.navigate(['/profile/new']);
        this.usersCollection.doc<User>(result.user.uid).set({});
        this.uiService.loadingStateChanged.next(false);
      })
      .catch((error) => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.alertAction(error.message, 'danger');
      });
  }

  // login user
  login(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.auth
      .signInWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        this.uiService.loadingStateChanged.next(false);
      })
      .catch((error) => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.alertAction(error.message, 'danger');
      });
  }

  // Logout user
  logout() {
    this.auth.signOut();
  }

  // Return a boolean if the user is authenticated
  isAuth() {
    return this.isAuthenticated;
  }
}
