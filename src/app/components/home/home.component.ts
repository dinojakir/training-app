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
  marginTop: number;
  marginBottom: number;
  tabWidth: number;
  tabHeight: number;
  tabLeftPadding: number;
  tabRightPadding: number;
  treeHeight: number;

  constructor(
    private db: DbService,
    private router: Router,
    public dialog: MatDialog,
    private storage: AngularFireStorage,
    private layoutService: LayoutService
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
    const muscles: any[] = await this.db.getCollectionDocuments("Muscles");
    const exercises: any[] = await this.db.getCollectionDocuments("Exercises");

    exercises.sort((a, b) => {
      const aMuscle: any = muscles.find((i) => i.item === a.muscles[0]);
      const bMuscle: any = muscles.find((i) => i.item === b.muscles[0]);

      return aMuscle.order - bMuscle.order;
    });

    this.exercises = exercises;

    this.loading = false;
  }

  onEdit(exercise: Exercise): void {
    this.router.navigate(["/vjezba"], { state: { data: exercise } });
  }

  onToolbarPreparing(e: any): void {
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

  async onDelete(exercise: Exercise): Promise<void> {
    this.openDialog(exercise);
  }

  getSource(exercise: Exercise): string | undefined {
    return exercise.video;
  }

  openDialog(exercise: Exercise): void {
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
}
