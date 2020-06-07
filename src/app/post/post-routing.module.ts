import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostWriteComponent } from './post-write/post-write.component';
import { redirectUnauthorizedTo, canActivate } from '@angular/fire/auth-guard';
import { PostDetailComponent } from './post-detail/post-detail.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/auth']);

const routes: Routes = [
  {
    path: ':postId/edit',
    pathMatch: 'full',
    component: PostWriteComponent,
  },
  {
    path: 'new',
    component: PostWriteComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  { path: ':postId', component: PostDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostRoutingModule {}
