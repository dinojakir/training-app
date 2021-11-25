import { Component } from "@angular/core";
import { AuthService } from "src/app/services/auth/auth.service";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.scss"],
})
export class SignInComponent {
  isLoadIndicatorVisible: boolean = false;

  constructor(public authService: AuthService) {}

  async onLogin(e: any) {
    await this.signIn(e.username, e.password);
  }

  async signIn(userEmail: any, userPassword: any): Promise<void> {
    this.isLoadIndicatorVisible = true;

    await this.authService.signIn(userEmail, userPassword);

    this.isLoadIndicatorVisible = false;
  }
}
