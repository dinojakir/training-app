import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "src/app/services/auth/auth.service";
import { DbService } from "src/app/services/auth/db.service";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  message: string = "";
  messages: any[] = [];

  constructor(
    public authService: AuthService,
    private db: DbService,
    public fireStore: AngularFirestore
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
      console.log(this.message);
      const user: string = this.authService?.user?.email
        .substring(0, 1)
        .toUpperCase();
      const date: any = Date.now();
      const message: any = {
        user: user,
        message: this.message,
        date: date,
        dateString: new Date(date).toUTCString(),
      };
      await this.db.saveCollectionDocument("Messages", message);

      this.message = "";
    }
  }
}
