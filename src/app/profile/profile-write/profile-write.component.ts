import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
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
  isLoading = true;

  private profileDoc: AngularFirestoreDocument<Profile>;
  profile: Observable<Profile>;
  profileImageObs: Observable<string>;

  profileForm = this.fb.group({});
  profileId: string;
  userId: string | null;

  routeSubscription: Subscription;
  profileSubscription: Subscription;
  loadingSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private uiService: UiService,
    private profileService: ProfileService,
    private auth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.uiService.loadingStateChanged.next(true);
    // Check if profile Id exists to determine if the user is editing or creating the profile
    this.routeSubscription = this.route.params.subscribe((params) => {
      const profileParams = params['profileId'].toString().split(':');
      this.profileId = profileParams[1];
      if (this.profileId) {
        // Profile exists already > update
        this.profileDoc = this.afs.doc<Profile>(`profiles/${this.profileId}`);
        this.profile = this.profileDoc.valueChanges();
        const ref = this.storage.ref(`images/${this.profileId}`);
        this.profileImageObs = ref.getDownloadURL();
        this.editMode = true;

        this.profileSubscription = this.profile.subscribe((profile) => {
          this.uiService.loadingStateChanged.next(false);
          this.profileForm = this.fb.group({
            name: [profile.name, Validators.required],
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
      } else {
        // Profile gets created
        this.profileId = this.afs.createId();
        this.uiService.loadingStateChanged.next(false);
        this.profileForm = this.fb.group({
          name: ['', Validators.required],
          email: ['', Validators.email],
          stackoverflow: [''],
          github: [''],
          description: ['', Validators.required],
          website: [''],
          location: ['', Validators.required],
          profession: [''],
          joined: [''],
          twitter: [''],
        });
      }
    });

    // Loading state
    this.loadingSubscription = this.uiService.loadingStateChanged.subscribe(
      (loading) => {
        this.isLoading = loading;
      }
    );

    // Get current user id
    this.auth.currentUser
      .then((user) => {
        this.userId = user.uid;
      })
      .catch((err) => console.log(err));
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
        email: this.f.email.value,
        stackoverflow: this.f.stackoverflow.value,
        github: this.f.github.value,
        description: this.f.description.value,
        website: this.f.website.value,
        location: this.f.location.value,
        profession: this.f.profession.value,
        twitter: this.f.twitter.value,
      };
      this.profileService.saveProfile(profile, this.profileId, true);
    } else {
      // create profile
      const profile: Profile = {
        name: this.f.name.value,
        email: this.f.email.value,
        stackoverflow: this.f.stackoverflow.value,
        github: this.f.github.value,
        description: this.f.description.value,
        website: this.f.website.value,
        twitter: this.f.twitter.value,
        location: this.f.location.value,
        profession: this.f.profession.value,
        joined: firebase.firestore.FieldValue.serverTimestamp(),
        userId: this.userId,
      };
      this.profileService.saveProfile(profile, this.profileId);
    }
  }

  // image upload
  uploadFile(event) {
    const file = event.target.files[0];
    const filePath = `images/${this.profileId}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    task
      .snapshotChanges()
      .pipe(finalize(() => (this.profileImageObs = fileRef.getDownloadURL())))
      .subscribe();
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      return this.routeSubscription.unsubscribe();
    }
    if (this.profileSubscription) {
      return this.profileSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      return this.loadingSubscription.unsubscribe();
    }
  }
}
