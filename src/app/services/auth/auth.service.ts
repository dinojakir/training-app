import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { DbService } from "./db.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  user: any;
  isAdmin: boolean = false;
  status = new Subject<{ isLoggedIn: boolean; isAdmin: boolean }>();

  constructor(
    private db: DbService,
    public fireAuth: AngularFireAuth,
    public fireStore: AngularFirestore,
    public router: Router
  ) {
    this.fireAuth.authState.subscribe((user: any) => {
      if (user) {
        this.user = user;
        localStorage.setItem("korisnik", JSON.stringify(user));
        this.isAdmin = user.authDomain === "training-app-1552e.firebaseapp.com";
        this.status.next({ isLoggedIn: true, isAdmin: this.isAdmin });
        this.router.navigate(["pocetna"]);
      } else {
        localStorage.removeItem("korisnik");
        this.user = undefined;
        this.isAdmin = false;
        this.status.next({ isLoggedIn: false, isAdmin: false });
        this.router.navigate(["prijava"]);
      }
    });
  }

  isLoggedIn(): boolean {
    const userStr: string | null = localStorage.getItem("korisnik");
    if (userStr) {
      const user = JSON.parse(userStr);

      if (
        !this.isAdmin &&
        user.authDomain &&
        user.authDomain === "training-app-1552e.firebaseapp.com"
      ) {
        this.isAdmin = true;
        this.status.next({ isLoggedIn: true, isAdmin: this.isAdmin });
      }
    }

    return userStr !== null;
  }

  async signIn(email: any, password: any): Promise<void> {
    const users: any = await this.db.getCollectionDocuments("Users");
    const user: any = users.find(
      (i: any) => i.email == email && i.password == password
    );
    if (user) {
      this.user = user;
      localStorage.setItem("korisnik", JSON.stringify(user));
      this.router.navigate(["pocetna"]);
    }
    this.fireAuth
      .signInWithEmailAndPassword(email, password)
      .catch(async () => {
        this.user = undefined;
        localStorage.removeItem("korisnik");
      });
  }

  async signOut(): Promise<void> {
    await this.fireAuth.signOut();
    this.user = undefined;
    localStorage.removeItem("korisnik");

    await this.router.navigate(["prijava"]);
  }
}
