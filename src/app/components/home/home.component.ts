import { Component, OnInit } from "@angular/core";
import { DbService } from "src/app/services/auth/db.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  exercises: any[] = [];
  displayedColumns: string[] = ["name", "type", "muscle"];

  constructor(private db: DbService) {}

  async ngOnInit(): Promise<void> {
    this.exercises = await this.db.getCollectionDocuments("Exercises");
  }
}
