import { Component, ViewChild } from "@angular/core";
import { AuthService } from "./services/auth/auth.service";
import { DxContextMenuComponent } from "devextreme-angular";
import { NavigationEnd, Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  @ViewChild(DxContextMenuComponent, { static: true })
  contextMenu: DxContextMenuComponent | undefined;
  contextMenuItems = [{ id: 1, text: "Odjava", icon: "dx-icon-export" }];
  menuItems: any[];
  url: string = "";

  constructor(public authService: AuthService, private router: Router) {
    this.menuItems = [
      { name: "Imenik", link: "/pocetna", icon: "dx-icon-bulletlist" },
      { name: "Vježba", link: "/vjezba", icon: "dx-icon-plus" },
      { name: "Postavke", link: "/postavke", icon: "dx-icon-preferences" },
    ];

    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;
      }
    });
  }

  async onItemClick(e: any): Promise<void> {
    switch (e.itemData.id) {
      case 1: {
        await this.authService.signOut();
        break;
      }
    }
  }

  onSelect(menuItem: any): void {
    this.router.navigate([menuItem.link]);
  }

  async onUserBtnClick(): Promise<void> {
    await this.contextMenu?.instance.show();
  }
}
