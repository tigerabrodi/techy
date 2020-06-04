import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Profile } from 'src/app/models/profile.model';
import { Observable, Subscription } from 'rxjs';
import { UiService } from 'src/app/shared/ui.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss'],
})
export class ProfileDetailComponent implements OnInit, OnDestroy {
  isLoading = true;

  private profileDoc: AngularFirestoreDocument<Profile>;
  profile: Observable<Profile>;
  profileImageObs: Observable<string>;

  profileId: string;
  userId: string | null;

  routeSubscription: Subscription;
  loadingSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private uiService: UiService,
    private auth: AngularFireAuth
  ) {
    this.uiService.loadingStateChanged.next(this.isLoading);
  }

  ngOnInit(): void {
    // Get the profile id through params
    this.routeSubscription = this.route.params.subscribe((params) => {
      const profileParams = params['profileId'].toString().split(':');
      this.profileId = profileParams[1];
      this.profileDoc = this.afs.doc<Profile>(`profiles/${this.profileId}`);
      this.profile = this.profileDoc.valueChanges();
      const ref = this.storage.ref(`images/${this.profileId}`);
      this.profileImageObs = ref.getDownloadURL();
    });

    // loading state
    this.loadingSubscription = this.profileImageObs.subscribe(() => {
      this.isLoading = false;
      this.uiService.loadingStateChanged.next(this.isLoading);
    });

    // Get current users id
    this.auth.currentUser
      .then((user) => {
        this.userId = user.uid;
      })
      .catch((err) => console.log(err));
  }

  ngOnDestroy() {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
