import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/services/auth/auth.service";
import { DbService } from "src/app/services/auth/db.service";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  message: string = "";
  constructor(public authService: AuthService, private db: DbService) {}

  ngOnInit(): void {}

  async submit(): Promise<void> {
    if (this.message) {
      console.log(this.message);
      const user: string = this.authService?.user?.email
        .substring(0, 1)
        .toUpperCase();
      const message: any = {
        user: user,
        message: this.message,
        date: Date.now(),
      };
      await this.db.saveCollectionDocument("Messages", message);

      this.message = "";
    }
  }
}
