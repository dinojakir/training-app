import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent {
  menuItems: any[];
  url: string = "";

  constructor(private router: Router) {
    this.menuItems = [
      { name: "Pregled", link: "/pocetna", icon: "dx-icon-bulletlist" },
      { name: "Nova vježba", link: "/vjezba", icon: "dx-icon-plus" },
      { name: "Postavke", link: "/postavke", icon: "dx-icon-preferences" },
      { name: "Poruke", link: "/poruke", icon: "dx-icon-message" },
      { name: "Korisnici", link: "/korisnici", icon: "dx-icon-user" },
      { name: "Razgovor", link: "/razgovor", icon: "dx-icon-coffee" },
    ];
  }

  onSelect(menuItem: any): void {
    this.router.navigate([menuItem.link]);
  }
}
