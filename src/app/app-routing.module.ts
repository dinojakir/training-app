import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddTrainingComponent } from "./components/add-training/add-training.component";
import { AddComponent } from "./components/add/add.component";
import { ChatComponent } from "./components/chat/chat.component";
import { ConfigurationComponent } from "./components/configuration/configuration.component";
import { HomeComponent } from "./components/home/home.component";
import { MessagesComponent } from "./components/messages/messages.component";
import { SignInComponent } from "./components/sign-in/sign-in.component";
import { UserComponent } from "./components/user/user.component";
import { UsersComponent } from "./components/users/users.component";
import { AdminGuard } from "./services/auth/admin-guard.service";
import { AuthGuard } from "./services/auth/auth-guard.service";
import { SignInGuard } from "./services/auth/sign-in-guard.service";

const routes: Routes = [
  {
    path: "",
    redirectTo: "pocetna",
    pathMatch: "full",
  },
  { path: "pocetna", component: HomeComponent, canActivate: [AuthGuard] },
  {
    path: "vjezba",
    component: AddComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "trening",
    component: AddTrainingComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "poruke",
    component: MessagesComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "postavke",
    component: ConfigurationComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "korisnik",
    component: UserComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "korisnici",
    component: UsersComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "razgovor",
    component: ChatComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  { path: "prijava", component: SignInComponent, canActivate: [SignInGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
