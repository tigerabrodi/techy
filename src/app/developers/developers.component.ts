import { Profile } from './../models/profile.model';
import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UiService } from '../shared/ui.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-developers',
  templateUrl: './developers.component.html',
  styleUrls: ['./developers.component.scss'],
})
export class DevelopersComponent implements OnInit {
  isLoading = true;
  private profileCollection: AngularFirestoreCollection<Profile>;
  profiles: Observable<Profile[]>;

  constructor(
    private afs: AngularFirestore,
    private uiService: UiService,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.profileCollection = this.afs.collection<Profile>('profiles');

    this.profiles = this.profileCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Profile;
          const id = a.payload.doc.id;
          const ref = this.storage.ref(`images/${id}`);
          const profileAvatar = ref.getDownloadURL();
          return { id, profileAvatar, ...data };
        })
      )
    );

    this.uiService.loadingStateChanged.next(this.isLoading);
  }

  onNavigateToProfile(profileId: string) {
    this.router.navigate([`/profile/:${profileId}`]);
  }

  ngOnInit(): void {
    this.profiles.subscribe(() => {
      this.isLoading = false;
      this.uiService.loadingStateChanged.next(this.isLoading);
    });
  }
}
