import { Component, ElementRef, Renderer2, ViewChild } from "@angular/core";
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
  @ViewChild("sidebar") sidebar: ElementRef | undefined;

  contextMenuItems = [{ id: 1, text: "Odjava", icon: "dx-icon-export" }];
  menuItems: any[];
  url: string = "";

  constructor(
    public authService: AuthService,
    private router: Router,
    private renderer: Renderer2
  ) {
    this.menuItems = [
      { name: "Pregled", link: "/pocetna", icon: "dx-icon-bulletlist" },
      { name: "Nova vježba", link: "/vjezba", icon: "dx-icon-plus" },
      { name: "Postavke", link: "/postavke", icon: "dx-icon-preferences" },
      { name: "Poruke", link: "/poruke", icon: "dx-icon-message" },
    ];

    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;
      }
    });

    this.renderer.listen("window", "click", (e: any) => {
      if (
        this.sidebar &&
        e.target &&
        !e.target.classList.contains("dx-icon-menu")
      ) {
        const shortFormPresent: boolean =
          window
            .getComputedStyle(this.sidebar.nativeElement)
            .getPropertyValue("z-index") === "1000";
        if (shortFormPresent) {
          this.sidebar.nativeElement.style.visibility = "hidden";
        }
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

  expandMenu(): void {
    if (this.sidebar) {
      this.sidebar.nativeElement.style.visibility = "visible";
    }
  }
}
