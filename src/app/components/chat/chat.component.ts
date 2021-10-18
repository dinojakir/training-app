import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  message: string = "";
  constructor() {}

  ngOnInit(): void {}

  submit(): void {
    if (this.message) {
      console.log(this.message);
      this.message = "";
    }
  }
}
