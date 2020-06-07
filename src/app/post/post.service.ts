import { Injectable } from '@angular/core';
import { Post } from '../models/post.model';
import { Router } from '@angular/router';
import { UiService } from '../shared/ui.service';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private postDoc: AngularFirestoreDocument<Post>;
  postsCollection: AngularFirestoreCollection<Post>;

  constructor(
    private router: Router,
    private uiService: UiService,
    private afs: AngularFirestore,
    private authService: AuthService
  ) {
    this.postsCollection = this.afs.collection<Post>('posts');
  }

  // create a new post if editMode is not passed, if editMode is passed as true, update the post
  savePost(post: Post, postId: string, editMode?: boolean) {
    if (editMode) {
      // edit post
      this.uiService.loadingStateChanged.next(true);
      this.postDoc = this.postsCollection.doc(postId);
      this.postDoc.update(post).then(() => {
        this.router.navigate([`/post/:${postId}`]);
        setTimeout(() => {
          this.uiService.loadingStateChanged.next(false);
        }, 1000);
      });
    } else {
      // create post
      this.uiService.loadingStateChanged.next(true);
      this.postsCollection
        .doc(postId)
        .set(post)
        .then(() => {
          this.router.navigate([`/post/:${postId}`]);
          setTimeout(() => {
            this.uiService.loadingStateChanged.next(false);
          }, 1000);
        });
    }
  }
}
