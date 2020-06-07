import { Component, OnInit, OnDestroy } from '@angular/core';
import { UiService } from 'src/app/shared/ui.service';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  AngularFirestoreDocument,
  AngularFirestore,
} from '@angular/fire/firestore';
import { Post } from 'src/app/models/post.model';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  isLoading: boolean;

  private postDoc: AngularFirestoreDocument<Post>;
  post: Observable<Post>;

  loadingSubscription: Subscription;
  routeSubscription: Subscription;

  postId: string;
  userId: string;

  constructor(
    private uiService: UiService,
    private route: ActivatedRoute,
    private auth: AngularFireAuth,
    private afs: AngularFirestore
  ) {}

  ngOnInit(): void {
    this.uiService.loadingStateChanged.next(true);

    this.routeSubscription = this.route.params.subscribe((params) => {
      const postParams = params['postId'].toString().split(':');
      this.postId = postParams[1];
      this.postDoc = this.afs.doc<Post>(`posts/${this.postId}`);
      this.post = this.postDoc.valueChanges();
      this.uiService.loadingStateChanged.next(false);
    });

    this.loadingSubscription = this.uiService.loadingStateChanged.subscribe(
      (loading) => {
        this.isLoading = loading;
      }
    );

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
