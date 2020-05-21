import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { redirectUnauthorizedTo, canActivate } from '@angular/fire/auth-guard';
import { ProfileDetailComponent } from './profile-detail/profile-detail.component';
import { ProfileWriteComponent } from './profile-write/profile-write.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/auth']);

const routes: Routes = [
  {
    path: ':profileId/edit',
    pathMatch: 'full',
    component: ProfileWriteComponent,
  },
  {
    path: 'new',
    component: ProfileWriteComponent,
    ...canActivate(redirectUnauthorizedToLogin),
  },
  { path: ':profileId', component: ProfileDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
