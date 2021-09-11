import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Exercise } from "src/app/model/exercise.dto";
import { DbService } from "src/app/services/auth/db.service";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";

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
  data: any[] = [];
  displayedColumns: string[] = ["name", "type", "edit", "delete"];
  expandedElement: any;
  isLoadIndicatorVisible: boolean = false;

  constructor(
    private db: DbService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoadIndicatorVisible = true;
    this.exercises = await this.db.getCollectionDocuments("Exercises");
    this.isLoadIndicatorVisible = false;

    const groups: string[] = [];
    this.exercises.forEach((i) => {
      if (groups.findIndex((j) => j === i.muscle) < 0) {
        groups.push(i.muscle);
      }
    });

    const data: any[] = [];
    groups.forEach((group) => {
      data.push({ group: group, isGroupBy: true });
      const filtered: Exercise[] = this.exercises.filter(
        (i) => i.muscle === group
      );
      filtered.forEach((j) => data.push(j));
    });

    this.data = data;
  }

  onEdit(exercise: Exercise): void {
    this.router.navigate(["/vjezba"], { state: { data: exercise } });
  }

  async onDelete(exercise: Exercise): Promise<void> {
    this.openDialog(exercise);
  }

  openDialog(exercise: Exercise): void {
    const dialogRef: any = this.dialog.open(ConfirmationDialogComponent, {
      width: "250px",
      data: exercise,
    });

    dialogRef.afterClosed().subscribe(async (result: Exercise) => {
      if (result) {
        await this.db.deleteCollectionDocument("Exercises", exercise);
        this.exercises = this.exercises.filter((i) => i.id !== exercise.id);
      }
    });
  }

  isGroup(index: any, item: any): boolean {
    return item.isGroupBy;
  }

  isElement(index: any, item: any): boolean {
    return !item.isGroupBy;
  }
}
