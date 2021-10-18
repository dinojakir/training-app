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

  submitClick(e: any): void {}
}
