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
  ) {}

  isLoggedIn(): boolean {
    const userStr: string | null = localStorage.getItem("korisnik");
    if (userStr) {
      const user = JSON.parse(userStr);
      this.user = user;

      if (
        !this.isAdmin &&
        user.authDomain &&
        user.authDomain === "training-app-1552e.firebaseapp.com"
      ) {
        this.isAdmin = true;
      }
    }

    this.status.next({ isLoggedIn: true, isAdmin: this.isAdmin });

    return userStr !== null;
  }

  async signIn(email: any, password: any): Promise<void> {
    const users: any = await this.db.getCollectionDocuments("Users");
    const user: any = users.find(
      (i: any) => i.email == email && i.password == password
    );

    if (user) {
      this.user = user;
      this.isAdmin = false;
      localStorage.setItem("korisnik", JSON.stringify(user));
      this.status.next({ isLoggedIn: true, isAdmin: false });

      this.router.navigate(["pocetna"]);
    } else {
      this.fireAuth
        .signInWithEmailAndPassword(email, password)
        .then((result) => {
          const userStr = JSON.stringify(result.user);
          this.user = JSON.parse(userStr);

          this.isAdmin = true;
          localStorage.setItem("korisnik", JSON.stringify(this.user));
          this.status.next({ isLoggedIn: true, isAdmin: this.isAdmin });

          this.router.navigate(["pocetna"]);
        });
    }
  }

  async signOut(): Promise<void> {
    if (this.isAdmin) {
      await this.fireAuth.signOut();
    }

    this.user = undefined;
    this.isAdmin = false;
    localStorage.removeItem("korisnik");
    this.status.next({ isLoggedIn: false, isAdmin: false });

    await this.router.navigate(["prijava"]);
  }
}
