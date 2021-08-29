import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddComponent } from "./components/add/add.component";
import { ConfigurationComponent } from "./components/configuration/configuration.component";
import { HomeComponent } from "./components/home/home.component";
import { SignInComponent } from "./components/sign-in/sign-in.component";
import { AuthGuard } from "./services/auth/auth-guard.service";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  { path: "home", component: HomeComponent, canActivate: [AuthGuard] },
  { path: "add", component: AddComponent, canActivate: [AuthGuard] },
  {
    path: "config",
    component: ConfigurationComponent,
    canActivate: [AuthGuard],
  },
  { path: "sign-in", component: SignInComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
