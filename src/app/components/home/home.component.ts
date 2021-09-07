import { Component, OnInit } from "@angular/core";
import { DbService } from "src/app/services/auth/db.service";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Router } from "@angular/router";
import { Exercise } from "src/app/model/exercise.dto";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  exercises: Exercise[] = [];
  displayedColumns: string[] = ["name", "type", "muscle", "edit"];
  expandedElement: any;
  isLoadIndicatorVisible: boolean = false;

  constructor(private db: DbService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.isLoadIndicatorVisible = true;
    this.exercises = await this.db.getCollectionDocuments("Exercises");
    this.isLoadIndicatorVisible = false;
  }

  onEdit(exercise: Exercise): void {
    this.router.navigate(["/vjezba"], { state: { data: exercise } });
  }
}
