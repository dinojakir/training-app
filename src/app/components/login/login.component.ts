import { Component, EventEmitter, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  @Output() login: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  submit(form: any) {
    if (form.valid) {
      this.login.emit(form.value);
    }
  }
}
