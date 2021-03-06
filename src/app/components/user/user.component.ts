import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { DxFormComponent } from "devextreme-angular";
import { DbService } from "src/app/services/auth/db.service";
import { v4 as uuidv4 } from "uuid";

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
export class UserComponent implements OnInit {
  @ViewChild(DxFormComponent, { static: false }) form:
    | DxFormComponent
    | undefined;

  editMode: boolean = false;
  formValid: boolean | undefined = false;
  saving: boolean = false;
  user: User = new User();

  constructor(private db: DbService, private router: Router) {
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onEmailChanged = this.onEmailChanged.bind(this);
    this.onPasswordChanged = this.onPasswordChanged.bind(this);
  }
  ngOnInit(): void {
    if (history.state.data) {
      this.editMode = true;
      const user: User = history.state.data;

      this.user.id = user.id;
      this.user.email = user.email;
      this.user.name = user.name;
      this.user.password = user.password;
    }
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
      if (!this.editMode) {
        this.user.id = uuidv4();
      }

      this.saving = true;
      this.form!.disabled = true;

      await this.db.saveCollectionDocument("Users", this.user);
      this.router.navigate(["korisnici"]);
    }
  }
}
