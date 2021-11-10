import { Component } from "@angular/core";
import { LayoutService } from "src/app/services/layout.service";

@Component({
  selector: "app-configuration",
  templateUrl: "./configuration.component.html",
  styleUrls: ["./configuration.component.scss"],
})
export class ConfigurationComponent {
  marginTop: number;
  marginBottom: number;
  tabWidth: number;
  tabHeight: number;
  tabLeftPadding: number;
  tabRightPadding: number;
  treeHeight: number;

  constructor(private layoutService: LayoutService) {
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
}
