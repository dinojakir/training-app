import { Component, OnInit } from "@angular/core";
import emailjs, { EmailJSResponseStatus } from "emailjs-com";

@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.scss"],
})
export class MessagesComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  public sendEmail(e: Event) {
    e.preventDefault();
    emailjs
      .sendForm(
        "service_howtorf",
        "template_xnp97jr",
        e.target as HTMLFormElement,
        "user_fiElQ5Jb2gNhiUqYf9G3E"
      )
      .then(
        (result: EmailJSResponseStatus) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
  }
}
