import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LayoutService {
  getResolution(): any {
    const width: number = window.screen.width * window.devicePixelRatio;
    const height: number = window.screen.height * window.devicePixelRatio;

    return {
      w: width,
      h: height,
      cw: window.innerWidth,
      ch: window.innerHeight,
    };
  }

  getMenuWidth(): number {
    const menuWidth: number = 300;

    return menuWidth;
  }
}
