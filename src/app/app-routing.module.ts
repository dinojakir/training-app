import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddComponent } from "./components/add/add.component";
import { ChatComponent } from "./components/chat/chat.component";
import { ConfigurationComponent } from "./components/configuration/configuration.component";
import { HomeComponent } from "./components/home/home.component";
import { MessagesComponent } from "./components/messages/messages.component";
import { SignInComponent } from "./components/sign-in/sign-in.component";
import { UsersComponent } from "./components/users/users.component";
import { AuthGuard } from "./services/auth/auth-guard.service";
import { SignInGuard } from "./services/auth/sign-in-guard.service";

const routes: Routes = [
  {
    path: "",
    redirectTo: "pocetna",
    pathMatch: "full",
  },
  { path: "pocetna", component: HomeComponent, canActivate: [AuthGuard] },
  { path: "vjezba", component: AddComponent, canActivate: [AuthGuard] },
  { path: "poruke", component: MessagesComponent, canActivate: [AuthGuard] },
  {
    path: "postavke",
    component: ConfigurationComponent,
    canActivate: [AuthGuard],
  },
  { path: "korisnici", component: UsersComponent, canActivate: [AuthGuard] },
  { path: "razgovor", component: ChatComponent, canActivate: [AuthGuard] },
  { path: "prijava", component: SignInComponent, canActivate: [SignInGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
