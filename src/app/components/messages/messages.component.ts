import { Component, OnInit, ViewChild } from "@angular/core";
import emailjs, { EmailJSResponseStatus } from "emailjs-com";

export class Message {
  title: string | undefined;
  email: string | undefined;
  text: string | undefined;
}

@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.scss"],
})
export class MessagesComponent implements OnInit {
  message: Message = new Message();

  constructor() {}

  ngOnInit(): void {}

  public confirm(): void {
    const forms: HTMLCollectionOf<HTMLFormElement> = document.forms;
    const emailForm: HTMLFormElement | null = forms.namedItem("emailform");
    if (emailForm) {
      emailjs
        .sendForm(
          "service_howtorf",
          "template_xnp97jr",
          emailForm,
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

  public send(e: Event): void {
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
