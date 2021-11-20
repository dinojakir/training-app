import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { DxFormComponent } from "devextreme-angular";
import { DbService } from "src/app/services/auth/db.service";

export class User {
  id: string | undefined;
  name: string | undefined;
  email: string | undefined;
  password: string | undefined;
}

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"],
})
export class UserComponent {
  @ViewChild(DxFormComponent, { static: false }) form:
    | DxFormComponent
    | undefined;

  formValid: boolean | undefined = false;
  saving: boolean = false;
  user: User = new User();

  constructor(private db: DbService, private router: Router) {
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onEmailChanged = this.onEmailChanged.bind(this);
    this.onPasswordChanged = this.onPasswordChanged.bind(this);
  }

  onNameChanged(): void {
    this.formValid = this.form?.instance.validate().isValid;
  }

  onEmailChanged(): void {
    this.formValid = this.form?.instance.validate().isValid;
  }

  onPasswordChanged(): void {
    this.formValid = this.form?.instance.validate().isValid;
  }

  async confirm(): Promise<void> {
    if (this.formValid) {
      this.saving = true;
      this.form!.disabled = true;

      await this.db.saveCollectionDocument("Users", this.user);
      this.router.navigate(["korisnici"]);
    }
  }
}
