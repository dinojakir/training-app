import { Component, ViewChild } from "@angular/core";
import { AuthService } from "./services/auth/auth.service";
import { DxContextMenuComponent } from "devextreme-angular";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  @ViewChild(DxContextMenuComponent, { static: true })
  contextMenu: DxContextMenuComponent | undefined;

  items: any[];
  title = "training-app";

  constructor(public authService: AuthService, private router: Router) {
    this.items = [
      { id: 1, text: "Postavke", icon: "dx-icon-preferences" },
      { id: 2, text: "Odjava", icon: "dx-icon-export" },
    ];
  }

  async onUserBtnClick(): Promise<void> {
    await this.contextMenu?.instance.show();
  }

  async itemClick(e: any): Promise<void> {
    switch (e.itemData.id) {
      case 1: {
        await this.router.navigate(["postavke"]);
        break;
      }
      case 2: {
        await this.authService.signOut();
        break;
      }
    }
  }
}
