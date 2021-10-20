import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import {
  AngularFireStorage,
  AngularFireStorageReference,
  AngularFireUploadTask,
} from "@angular/fire/storage";

import { AuthService } from "src/app/services/auth/auth.service";
import { DbService } from "src/app/services/auth/db.service";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  file: any;
  message: string = "";
  messages: any[] = [];
  uploadPercent: number | undefined;

  constructor(
    public authService: AuthService,
    private db: DbService,
    public fireStore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  async ngOnInit(): Promise<void> {
    this.messages = (await this.db.getCollectionDocuments("Messages")).sort(
      (a, b) => (a.date - b.date <= 0 ? -1 : 1)
    );

    this.fireStore
      .collection("Messages")
      .snapshotChanges(["added", "removed", "modified"])
      .subscribe(async () => {
        this.messages = (await this.db.getCollectionDocuments("Messages")).sort(
          (a, b) => (a.date - b.date <= 0 ? -1 : 1)
        );
      });
  }

  async submit(): Promise<void> {
    if (this.message) {
      const user: string = this.authService?.user?.email
        .substring(0, 1)
        .toUpperCase();
      const date: any = Date.now();
      const messageDto: any = {
        user: user,
        image: null,
        message: null,
        date: date,
        dateString: new Date(date).toUTCString(),
      };
      if (this.file && this.file.name === this.message) {
        const filePath: string = `Chats/${this.file.name}`;
        const fileRef: AngularFireStorageReference = this.storage.ref(filePath);

        const task: AngularFireUploadTask = this.storage.upload(
          filePath,
          this.file
        );
        task.percentageChanges().subscribe((value) => {
          this.uploadPercent = value;
        });
        await task;
        const url: any = await fileRef.getDownloadURL().toPromise();

        messageDto.image = url;
      } else {
        messageDto.message = this.message;
      }

      await this.db.saveCollectionDocument("Messages", messageDto);

      this.message = "";
    }
  }

  onFileSelected(e: any): void {
    this.file = e.target.files[0];
    this.message = this.file.name;
  }
}
