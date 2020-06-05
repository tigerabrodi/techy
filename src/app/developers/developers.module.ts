import { NgModule } from '@angular/core';

import { DevelopersRoutingModule } from './developers-routing.module';
import { DevelopersComponent } from './developers.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DevelopersComponent],
  imports: [SharedModule, DevelopersRoutingModule],
})
export class DevelopersModule {}
