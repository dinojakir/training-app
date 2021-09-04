import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  menuItems = [
    { name: "Vjezba", link: "/add", icon: "dx-icon-plus" },
    { name: "Postavke", link: "/postavke", icon: "dx-icon-preferences" },
  ];

  constructor(private router: Router) {}

  onSelect(menuItem: any): void {
    this.router.navigate([menuItem.link]);
  }
}
