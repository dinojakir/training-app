import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddComponent } from "./components/add/add.component";
import { ConfigurationComponent } from "./components/configuration/configuration.component";
import { HomeComponent } from "./components/home/home.component";
import { SignInComponent } from "./components/sign-in/sign-in.component";
import { AuthGuard } from "./services/auth/auth-guard.service";
import { SignInGuard } from "./services/auth/sign-in-guard.service";

const routes: Routes = [
  {
    path: "",
    redirectTo: "pocetna",
    pathMatch: "full",
  },
  { path: "pocetna", component: HomeComponent, canActivate: [AuthGuard] },
  { path: "add", component: AddComponent, canActivate: [AuthGuard] },
  {
    path: "postavke",
    component: ConfigurationComponent,
    canActivate: [AuthGuard],
  },
  { path: "prijava", component: SignInComponent, canActivate: [SignInGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
