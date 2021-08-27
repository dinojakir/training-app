import { Component, ViewChild } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { DxContextMenuComponent } from 'devextreme-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild(DxContextMenuComponent, { static: true })
  contextMenu: DxContextMenuComponent | undefined;

  items: any[];
  title = 'training-app';

  constructor(public authService: AuthService) {
    this.items = [{ id: 1, text: 'Sign out' }];
  }

  async onUserBtnClick(): Promise<void> {
    await this.contextMenu?.instance.show();
  }

  itemClick(e: any): void {
    if (e.itemData.id === 1) {
      this.authService.signOut();
    }
  }
}
