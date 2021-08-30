import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class SignInGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    if (this.authService.isLoggedIn()) {
      await this.router.navigate(["pocetna"]);
      return false;
    } else {
      return true;
    }
  }
}
