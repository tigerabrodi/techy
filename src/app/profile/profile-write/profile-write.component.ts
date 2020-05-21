import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription, Observable, Timestamp } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Profile } from 'src/app/models/profile.model';
import { UiService } from 'src/app/shared/ui.service';
import { ProfileService } from '../profile.service';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-profile-write',
  templateUrl: './profile-write.component.html',
  styleUrls: ['./profile-write.component.scss'],
})
export class ProfileWriteComponent implements OnInit, OnDestroy {
  editMode = false;
  isLoading = false;

  private profileDoc: AngularFirestoreDocument<Profile>;
  profile: Observable<Profile>;
  profileImageObs: Observable<string | null>;
  profileImagePath: string | null = '';

  profileForm = this.fb.group({});
  profileId: string;
  userId: string | null;

  routeSubscription: Subscription;
  imageSubscription: Subscription;
  profileSubscription: Subscription;
  loadingSusbcription: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private uiService: UiService,
    private profileService: ProfileService,
    private auth: AngularFireAuth
  ) {
    // Get current users unique id
    this.auth.currentUser
      .then((user) => {
        this.userId = user.uid;
      })
      .catch((err) => {
        console.log('User id not defined', err);
      });
  }

  ngOnInit(): void {
    // Check if profile Id exists to determine if the user is editing or creating the profile
    this.routeSubscription = this.route.params.subscribe((params) => {
      this.profileId = params['profileId'];
      this.profileDoc = this.afs.doc<Profile>(`profiles/${this.profileId}`);
      this.profile = this.profileDoc.valueChanges();
      if (this.profileId) {
        // Profile exists already > update
        const ref = this.storage.ref(`images/${this.profileId}`);
        this.profileImageObs = ref.getDownloadURL();
        this.editMode = true;
        console.log(this.editMode);
        this.imageSubscription = this.profileImageObs.subscribe((path) => {
          this.profileImagePath = path;
          this.profileSubscription = this.profile.subscribe((profile) => {
            this.profileForm = this.fb.group({
              name: [profile.name, Validators.required],
              image: [this.profileImagePath],
              email: [profile.email, Validators.email],
              stackoverflow: [profile.stackoverflow],
              github: [profile.github],
              description: [profile.description],
              website: [profile.website],
              location: [profile.location, Validators.required],
              profession: [profile.profession],
              joined: [profile.joined],
              twitter: [profile.twitter],
            });
          });
        });
      } else {
        // Profile gets created
        console.log(this.editMode);
        this.profileForm = this.fb.group({
          name: ['', Validators.required],
          image: [this.profileImagePath],
          email: ['', Validators.email],
          stackoverflow: [''],
          github: [''],
          description: [''],
          website: [''],
          location: ['', Validators.required],
          profession: [''],
          joined: [''],
          twitter: [''],
        });
      }
    });

    // Loading state
    this.loadingSusbcription = this.uiService.loadingStateChanged.subscribe(
      (loading) => {
        this.isLoading = loading;
      }
    );
  }

  // access the controls
  get f() {
    return this.profileForm.controls;
  }

  // Fire saveProfile function, which updates the profile if profileId is passed otherwise it creates the profile.
  onSubmit() {
    if (this.editMode) {
      // edit profile
      const profile: Profile = {
        name: this.f.name.value,
        image: this.f.image.value,
        email: this.f.email.value,
        stackoverflow: this.f.stackoverflow.value,
        github: this.f.github.value,
        description: this.f.description.value,
        website: this.f.website.value,
        location: this.f.location.value,
        profession: this.f.profession.value,
        joined: firebase.firestore.FieldValue.serverTimestamp(),
        userId: this.userId,
      };
      this.profileService.saveProfile(profile, this.profileId);
    } else {
      // create profile
      const profile: Profile = {
        name: this.f.name.value,
        image: this.f.image.value,
        email: this.f.email.value,
        stackoverflow: this.f.stackoverflow.value,
        github: this.f.github.value,
        description: this.f.description.value,
        website: this.f.website.value,
        location: this.f.location.value,
        profession: this.f.profession.value,
        joined: firebase.firestore.FieldValue.serverTimestamp(),
        userId: this.userId,
      };
      this.profileService.saveProfile(profile);
    }
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      return this.routeSubscription.unsubscribe();
    }
    if (this.profileSubscription) {
      return this.profileSubscription.unsubscribe();
    }
    if (this.imageSubscription) {
      return this.imageSubscription.unsubscribe();
    }
    if (this.loadingSusbcription) {
      return this.loadingSusbcription.unsubscribe();
    }
  }
}
