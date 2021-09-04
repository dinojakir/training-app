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
  menuItems = [
    { name: "Vjezba", link: "/add", icon: "dx-icon-plus" },
    { name: "Postavke", link: "/postavke", icon: "dx-icon-preferences" },
  ];

  items: any[];
  title = "training-app";
  url: string = "";

  constructor(public authService: AuthService, private router: Router) {
    this.items = [
      { id: 1, text: "Postavke", icon: "dx-icon-preferences" },
      { id: 2, text: "Odjava", icon: "dx-icon-export" },
    ];

    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;
      }
    });
  }

  onSelect(menuItem: any): void {
    this.router.navigate([menuItem.link]);
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
