import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { Post } from 'src/app/models/post.model';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UiService } from 'src/app/shared/ui.service';
import { PostService } from '../post.service';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user.model';
import * as firebase from 'firebase';

@Component({
  selector: 'app-post-write',
  templateUrl: './post-write.component.html',
  styleUrls: ['./post-write.component.scss'],
})
export class PostWriteComponent implements OnInit, OnDestroy {
  editMode = false;
  isLoading = true;

  private usersCollection: AngularFirestoreCollection<User>;
  private postDoc: AngularFirestoreDocument<Post>;
  post: Observable<Post>;

  postForm: FormGroup;
  postId: string;
  userId: string | null;
  currentUserName: any;

  // Date when the post was created
  created: any;

  routeSubscription: Subscription;
  postSubscription: Subscription;
  loadingSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private afs: AngularFirestore,
    private uiService: UiService,
    private postService: PostService,
    private auth: AngularFireAuth,
    private authService: AuthService
  ) {
    this.usersCollection = this.afs.collection<User>('users');
  }

  ngOnInit(): void {
    this.uiService.loadingStateChanged.next(true);
    //check if the postId exists to determine whether the user is editing or creating the profile
    this.routeSubscription = this.route.params.subscribe((params) => {
      if (params['postId']) {
        this.editMode = true;
        const postParams = params['postId'].toString().split(':');
        this.postId = postParams[1];
        // post exists already > update
        this.postDoc = this.afs.doc<Post>(`posts/${this.postId}`);
        this.post = this.postDoc.valueChanges();

        this.postSubscription = this.post.subscribe((post) => {
          this.uiService.loadingStateChanged.next(false);

          this.postForm = this.fb.group({
            title: [post.title, Validators.required],
            body: [post.body, Validators.required],
          });
        });
      } else {
        this.postId = this.afs.createId();
        this.created = new Date();
        this.uiService.loadingStateChanged.next(false);
        this.postForm = this.fb.group({
          title: ['', Validators.required],
          body: ['', Validators.required],
        });
      }
    });

    // loading state
    this.loadingSubscription = this.uiService.loadingStateChanged.subscribe(
      (loading) => {
        this.isLoading = loading;
      }
    );

    // Get current user id
    this.auth.currentUser
      .then((user) => {
        this.userId = user.uid;
        const currentUserRef = this.usersCollection
          .doc<User>(this.userId)
          .valueChanges();
        currentUserRef.subscribe((user) => {
          this.currentUserName = user.name;
        });
      })
      .catch((err) => console.log(err));
  }

  // access the controls
  get title() {
    return this.postForm.get('title');
  }

  get body() {
    return this.postForm.get('body');
  }

  // fire savePost function, if editMode is passed in as true, update the post otherwise create a new one.
  onSubmit() {
    if (this.editMode) {
      this.uiService.alertAction('Successfully updated your post!', 'success');
      // update post
      const post: Post = {
        title: this.title.value,
        body: this.body.value,
      };
      this.postService.savePost(post, this.postId, true);
    } else {
      // create new post
      this.uiService.alertAction('Successfully created your post!', 'success');
      const post: Post = {
        title: this.title.value,
        body: this.body.value,
        author: this.currentUserName,
        created: this.created,
        userId: this.userId,
      };
      this.postService.savePost(post, this.postId);
    }
  }

  ngOnDestroy() {
    if (this.postSubscription) {
      this.postSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
