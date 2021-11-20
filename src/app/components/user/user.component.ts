import { Component, OnInit, ViewChild } from "@angular/core";
import { DxFormComponent } from "devextreme-angular";

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

  formValid: boolean | undefined = false;
  user: User = new User();

  constructor() {
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onEmailChanged = this.onEmailChanged.bind(this);
    this.onPasswordChanged = this.onPasswordChanged.bind(this);
  }

  ngOnInit(): void {}

  onNameChanged() {
    this.formValid = this.form?.instance.validate().isValid;
  }

  onEmailChanged() {
    this.formValid = this.form?.instance.validate().isValid;
  }

  onPasswordChanged() {
    this.formValid = this.form?.instance.validate().isValid;
  }

  confirm() {}
}
