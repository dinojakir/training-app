import { Component, OnInit } from "@angular/core";

export class Message {
  title: string | undefined;
  email: string | undefined;
  text: string | undefined;
  attachment: string | undefined;
}

declare var gapi: any;

@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.scss"],
})
export class MessagesComponent implements OnInit {
  file: any;
  isSignedIn: boolean = false;
  message: Message = new Message();
  attach: any;

  ngOnInit(): void {
    const _this: MessagesComponent = this;
    gapi.load("client:auth2", _this.initClient);
  }

  async onFileSelected(e: any): Promise<void> {
    this.file = e.target.files[0];
    this.message.attachment = this.file.name;

    this.attach = await this.getBase64(this.file);
  }

  async confirm(): Promise<void> {
    console.log(this.isSignedIn);
    await gapi.auth2.getAuthInstance().signIn({
      scope: "profile email",
    });

    await this.sendMessage();
  }

  async getBase64(file: any): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async initClient(): Promise<void> {
    const apiKey: string = "AIzaSyARRbZw0JB7zqOXZETwhDR-z_4C8LoRuLE";
    const clientId: string =
      "860382123806-2tlpaergvsm1md9hha7ufff3jomrv6us.apps.googleusercontent.com";
    const discoveryDocs: string[] = [
      "https://gmail.googleapis.com/$discovery/rest?version=v1",
    ];
    const scopes: string = "https://mail.google.com/";

    await gapi.client.init({
      apiKey: apiKey,
      discoveryDocs: discoveryDocs,
      clientId: clientId,
      scope: scopes,
    });
  }

  async sendMessage(): Promise<void> {
    const nl: string = "\n";
    const boundary: string = "__myapp__";
    const to: string = "dino.jakir.mobile@gmail.com";
    const subject: string = "Hi";
    const message: string = "hello";

    const str: string = [
      "MIME-Version: 1.0",
      "Content-Transfer-Encoding: 7bit",
      "to: " + to,
      "subject: " + subject,
      "Content-Type: multipart/alternate; boundary=" + boundary + nl,
      "--" + boundary,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 7bit" + nl,
      message + nl,
      "--" + boundary,
      "--" + boundary,
      "Content-Type: Application/pdf; name=myPdf.pdf",
      "Content-Disposition: attachment; filename=myPdf.pdf",
      "Content-Transfer-Encoding: base64" + nl,
      this.attach,
      "--" + boundary + "--",
    ].join("\n");

    const encodedMessage: string = btoa(str);

    const encodedMail: string = encodedMessage
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    await gapi.client.gmail.users.messages.send({
      userId: "me",
      raw: encodedMail,
    });
  }

  async signoutClick(): Promise<void> {
    await gapi.auth2.getAuthInstance().signOut();
  }

  updateSigninStatus(signedIn: boolean): void {
    this.isSignedIn = signedIn;
  }
}
