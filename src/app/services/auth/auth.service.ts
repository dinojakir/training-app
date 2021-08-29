import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  user: any;

  constructor(
    public fireAuth: AngularFireAuth,
    public fireStore: AngularFirestore,
    public router: Router
  ) {
    this.fireAuth.authState.subscribe((user) => {
      if (user) {
        this.user = user;
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
        this.user = undefined;
        this.router.navigate(["sign-in"]);
      }
    });
  }

  isLoggedIn(): boolean {
    const user: string | null = localStorage.getItem("user");
    return user !== null;
  }

  signIn(email: any, password: any): Promise<boolean> {
    return this.fireAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        if (result.user) {
          this.user = result.user;
          localStorage.setItem("user", JSON.stringify(result.user));
          this.router.navigate(["home"]);
        }

        return true;
      })
      .catch(() => {
        this.user = undefined;
        localStorage.removeItem("user");
        return false;
      });
  }

  signOut(): Promise<void> {
    return this.fireAuth.signOut().then(() => {
      this.user = undefined;
      localStorage.removeItem("user");
      this.router.navigate(["sign-in"]);
    });
  }
}
