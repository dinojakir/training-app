import { Component, OnInit, ViewChild } from "@angular/core";
import { DxFormComponent } from "devextreme-angular";

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
  @ViewChild(DxFormComponent, { static: false }) form:
    | DxFormComponent
    | undefined;

  file: any;
  message: Message = new Message();
  attach: any;
  formValid: boolean | undefined = false;

  constructor() {
    this.onTitleChanged = this.onTitleChanged.bind(this);
    this.onEmailChanged = this.onEmailChanged.bind(this);
  }

  ngOnInit(): void {
    const _this: MessagesComponent = this;
    gapi.load("client:auth2", _this.initClient);
  }

  async onFileSelected(e: any): Promise<void> {
    this.file = e.target.files[0];
    this.message.attachment = this.file.name;

    const arrayBuffer: any = await this.getArrayBuffer(this.file);
    this.attach = await this.arrayBufferToProperBase64(arrayBuffer);
  }

  onEmailChanged(e: any): void {
    this.formValid = this.form?.instance.validate().isValid;
  }

  onTitleChanged(e: any): void {
    this.formValid = this.form?.instance.validate().isValid;
  }

  arrayBufferToProperBase64(buffer: any): string {
    var binary: string = "";
    var bytes: any = new Uint8Array(buffer);
    var len: number = bytes.byteLength;
    for (let i: number = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async confirm(): Promise<void> {
    await gapi.auth2.getAuthInstance().signIn({
      scope: "profile email",
    });

    await this.sendMessage();
  }

  async getArrayBuffer(file: any): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();
      reader.readAsArrayBuffer(file);
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
    const to: string = this.message.email!;
    const subject: string = this.message.title ?? "";
    const message: string = this.message.text ?? "";

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

    this.message = new Message();
    this.file = undefined;
    this.attach = undefined;
    this.formValid = false;
  }

  async signoutClick(): Promise<void> {
    await gapi.auth2.getAuthInstance().signOut();
  }
}
