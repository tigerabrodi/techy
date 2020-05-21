import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UiService } from '../shared/ui.service';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { Profile } from '../models/profile.model';

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
    private afs: AngularFirestore
  ) {
    // profiles collection
    this.profilesCollection = this.afs.collection<Profile>('profiles');
  }

  // Save or update the profile, update if profiles id was passed, otherwise create a new profile
  saveProfile(profile: Profile, profileId?: string) {
    if (profileId) {
      // create profile
      this.uiService.loadingStateChanged.next(true);
      this.profileDoc = this.afs.doc(`profiles/${profileId}`);
      this.profileDoc
        .set(profile)
        .then(() => {
          this.router.navigate([`/profile/:${profileId}`]);
          this.uiService.loadingStateChanged.next(false);
        })
        .catch((err) => console.log(err));
    } else {
      // update profile
      this.uiService.loadingStateChanged.next(true);
      const id = this.afs.createId();
      this.profilesCollection
        .doc(id)
        .set(profile)
        .then(() => {
          this.router.navigate([`profile/:${id}`]);
          this.uiService.loadingStateChanged.next(false);
        })
        .catch((err) => console.log(err));
    }
  }
}
