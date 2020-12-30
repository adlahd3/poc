import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InquiryFormComponent } from './inquiry-form/inquiry-form.component';

const routes: Routes = [
  {path: 'inquire', component: InquiryFormComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
