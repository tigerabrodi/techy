import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UiService } from '../shared/ui.service';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { Profile } from '../models/profile.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private userId: string | null;
  private profileDoc: AngularFirestoreDocument<Profile>;
  profilesCollection: AngularFirestoreCollection<Profile>;

  constructor(
    private router: Router,
    private uiService: UiService,
    private afs: AngularFirestore,
    private authService: AuthService
  ) {
    // profiles collection
    this.profilesCollection = this.afs.collection<Profile>('profiles');
  }

  // Save or update the profile, update if editMode was passed as true, otherwise create a new profile
  saveProfile(profile: Profile, profileId: string, editMode?: boolean) {
    this.authService.updateCurrentUser(profile.name, profileId);
    if (editMode) {
      // create profile
      this.uiService.loadingStateChanged.next(true);
      this.profileDoc = this.afs.doc(`profiles/${profileId}`);
      this.profileDoc
        .update(profile)
        .then(() => {
          this.router.navigate([`/profile/:${profileId}`]);
          this.uiService.loadingStateChanged.next(false);
        })
        .catch((err) => console.log(err));
    } else {
      // update profile
      this.uiService.loadingStateChanged.next(true);
      this.profilesCollection
        .doc(profileId)
        .set(profile)
        .then(() => {
          this.router.navigate([`profile/:${profileId}`]);
          this.uiService.loadingStateChanged.next(false);
        })
        .catch((err) => console.log(err));
    }
  }
}
