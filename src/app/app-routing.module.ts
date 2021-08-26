import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddComponent } from './components/add/add.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: 'config', component: ConfigurationComponent },
  { path: 'add', component: AddComponent },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
