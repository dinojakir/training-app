import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Exercise } from "src/app/model/exercise.dto";
import { Training } from "src/app/model/training.dto";
import { DbService } from "src/app/services/auth/db.service";
import { LayoutService } from "src/app/services/layout.service";
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
  loading: boolean = false;
  marginBottom: number;
  marginTop: number;
  tabHeight: number;
  tabWidth: number;
  tabLeftPadding: number;
  tabRightPadding: number;
  trainings: any[] = [];
  treeHeight: number;

  constructor(
    private db: DbService,
    private router: Router,
    public dialog: MatDialog,
    private layoutService: LayoutService,
    private storage: AngularFireStorage
  ) {
    const res: any = this.layoutService.getResolution();
    const maxWidth: number = 1000;
    this.marginTop = 30;
    this.marginBottom = 30;
    this.tabLeftPadding = 100;
    this.tabRightPadding = 100;
    this.tabWidth = Math.max(
      res.cw -
        this.tabLeftPadding -
        this.tabRightPadding -
        this.layoutService.getMenuWidth(),
      maxWidth
    );
    this.tabHeight = res.ch - this.marginTop - this.marginBottom - 60;
    this.treeHeight = this.tabHeight - 200;
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    const exercises: any[] = await this.db.getCollectionDocuments("Exercises");
    const trainings: any[] = await this.db.getCollectionDocuments("Trainings");

    this.exercises = exercises;
    this.trainings = trainings;

    this.loading = false;
  }

  onEditExercise(exercise: Exercise): void {
    this.router.navigate(["/vjezba"], { state: { data: exercise } });
  }

  onEditTraining(training: Training): void {
    this.router.navigate(["/trening"], { state: { data: training } });
  }

  onToolbarPreparingExercise(e: any): void {
    let toolbarItems: any = e.toolbarOptions.items;
    const _this: any = this;

    toolbarItems.push({
      widget: "dxButton",
      options: {
        elementAttr: { id: "addBtn", class: "add-button" },
        icon: "add",
        onClick: function (): void {
          _this.router.navigate(["/vjezba"]);
        },
      },
      location: "after",
    });
  }

  onToolbarPreparingTraining(e: any): void {
    let toolbarItems: any = e.toolbarOptions.items;
    const _this: any = this;

    toolbarItems.push({
      widget: "dxButton",
      options: {
        elementAttr: { id: "addBtn", class: "add-button" },
        icon: "add",
        onClick: function (): void {
          _this.router.navigate(["/trening"]);
        },
      },
      location: "after",
    });
  }

  async onDeleteExercise(exercise: Exercise): Promise<void> {
    this.openDialogExercise(exercise);
  }

  async onDeleteTraining(training: Training): Promise<void> {
    this.openDialogTraining(training);
  }

  getSource(exercise: Exercise): string | undefined {
    return exercise.video;
  }

  openDialogExercise(exercise: Exercise): void {
    const dialogRef: any = this.dialog.open(ConfirmationDialogComponent, {
      width: "250px",
      data: exercise,
    });

    dialogRef.afterClosed().subscribe(async (result: Exercise) => {
      if (result) {
        if (exercise.video) {
          await this.storage.refFromURL(exercise.video).delete().toPromise();
        }

        await this.db.deleteCollectionDocument("Exercises", exercise);
        this.exercises = this.exercises.filter((i) => i.id !== exercise.id);
      }
    });
  }

  openDialogTraining(training: Training): void {
    const dialogRef: any = this.dialog.open(ConfirmationDialogComponent, {
      width: "250px",
      data: training,
    });

    dialogRef.afterClosed().subscribe(async (result: Training) => {
      if (result) {
        await this.db.deleteCollectionDocument("Trainings", training);
        this.trainings = this.trainings.filter((i) => i.id !== training.id);
      }
    });
  }
}
