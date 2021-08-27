import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  isLoadIndicatorVisible: boolean = false;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {}

  async signIn(userEmail: any, userPassword: any) {
    this.isLoadIndicatorVisible = true;

    await this.authService.signIn(userEmail, userPassword);

    this.isLoadIndicatorVisible = false;
  }
}
