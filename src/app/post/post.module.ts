import { NgModule } from '@angular/core';

import { PostRoutingModule } from './post-routing.module';
import { PostComponent } from './post.component';
import { PostWriteComponent } from './post-write/post-write.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [PostComponent, PostWriteComponent, PostDetailComponent],
  imports: [SharedModule, RouterModule, ReactiveFormsModule, PostRoutingModule],
})
export class PostModule {}
