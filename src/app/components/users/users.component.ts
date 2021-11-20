import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Exercise } from "src/app/model/exercise.dto";
import { DbService } from "src/app/services/auth/db.service";
import { LayoutService } from "src/app/services/layout.service";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
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
    const users: any[] = await this.db.getCollectionDocuments("Users");

    this.users = users;

    this.loading = false;
  }

  onEdit(user: any): void {
    this.router.navigate(["/korisnik"], { state: { data: user } });
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
          _this.router.navigate(["/korisnik"]);
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

  openDialog(user: any): void {
    const dialogRef: any = this.dialog.open(ConfirmationDialogComponent, {
      width: "250px",
      data: user,
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        await this.db.deleteCollectionDocument("Users", user);
        this.users = this.users.filter((i) => i.id !== user.id);
      }
    });
  }
}
