import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { DxFormComponent, DxTreeListComponent } from "devextreme-angular";
import { DbService } from "src/app/services/auth/db.service";
import { v4 as uuidv4 } from "uuid";

class NewItem {
  Naziv: string = "";
  Grupa: string = "";
}

@Component({
  selector: "app-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.scss"],
})
export class ConfigComponent implements OnInit {
  @ViewChild(DxTreeListComponent, { static: false }) treeList:
    | DxTreeListComponent
    | undefined;
  @ViewChild(DxFormComponent, { static: false }) form:
    | DxFormComponent
    | undefined;

  @Input() setting: string = "";

  addButtonOptions: any;
  closeButtonOptions: any;
  loading: boolean = false;
  newItem: NewItem = new NewItem();
  items: any[] = [];
  popupVisible: boolean = false;
  saving: boolean = false;
  settings: any[] = [];
  title: string = "";

  constructor(private db: DbService) {
    const _this: any = this;
    this.onReorder = this.onReorder.bind(this);

    this.addButtonOptions = {
      icon: "check",
      text: "Dodaj",
      onClick: function (): void {
        if (_this.form) {
          const validationStatus: any = _this.form.instance.validate();
          if (validationStatus.isValid) {
            _this.settings.push({
              name: _this.newItem.Naziv,
              parent: _this.newItem.Grupa || null,
            });
            _this.popupVisible = false;
          }
        }
      },
    };
    this.closeButtonOptions = {
      icon: "close",
      text: "Odustani",
      onClick: function (): void {
        _this.popupVisible = false;
      },
    };
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    switch (this.setting) {
      case "Muscles":
        this.title = "Mišić";
        break;
      case "Props":
        this.title = "Rekvizit";
        break;
      case "Trainers":
        this.title = "Trenažer";
        break;
    }

    const settings: any[] = (
      await this.db.getCollectionDocuments(this.setting)
    ).sort((a: any, b: any) => a.order - b.order);

    const data: any[] = [];
    settings.forEach((i: any) => {
      data.push({ name: i.item, parent: null });
      if (i.children && i.children.length > 0) {
        i.children.forEach((j: any) => {
          data.push({ name: j.item, parent: i.item });
        });
      }
    });

    this.items = data.filter((i) => i.parent === null).map((j) => j.name);
    this.settings = data;
    this.loading = false;
  }

  onReorder(e: any): void {
    const visibleRows: any = e.component.getVisibleRows();

    const source: any = e.itemData;
    const toIndex: any = e.fromIndex > e.toIndex ? e.toIndex - 1 : e.toIndex;
    let targetData: any = toIndex >= 0 ? visibleRows[toIndex].node.data : null;

    if (
      source.parent === null ||
      (targetData && source.parent === targetData.parent) ||
      (targetData && source.parent === targetData.name)
    ) {
      const sourceIndex: any = this.settings.indexOf(source);
      this.settings.splice(sourceIndex, 1);

      const targetIndex: any = this.settings.indexOf(targetData) + 1;
      this.settings.splice(targetIndex, 0, source);
    }
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
          _this.popupVisible = true;
        },
      },
      location: "after",
    });
  }

  async save(): Promise<void> {
    if (this.settings && this.settings.length > 0) {
      this.saving = true;

      const settings: any[] = await this.db.getCollectionDocuments(
        this.setting
      );
      for (const setting of settings) {
        if (setting.id) {
          await this.db.deleteCollectionDocument(this.setting, setting);
        }
      }

      let idx: number = 1;
      for (const setting of this.settings) {
        if (setting.parent === null) {
          const id: any = uuidv4();
          let children: any[] = this.settings.filter(
            (i) => i.parent === setting.name
          );
          if (children.length > 0) {
            children = children.map((i, index) => {
              return { item: i.name, order: index, id: uuidv4(), parent: id };
            });
          }
          const newSetting: any = {
            id: id,
            item: setting.name,
            children: children,
            order: idx,
          };
          await this.db.saveCollectionDocument(this.setting, newSetting);

          idx++;
        }
      }

      this.saving = false;
    }
  }

  getKey(rowData: any): string {
    return rowData.parent
      ? `${rowData.parent}-${rowData.name}`
      : `${rowData.name}`;
  }
}
