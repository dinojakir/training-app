import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DxFormComponent, DxTreeListComponent } from "devextreme-angular";
import { DbService } from "src/app/services/auth/db.service";
import { LayoutService } from "src/app/services/layout.service";
import { v4 as uuidv4 } from "uuid";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";

class NewItem {
  Naziv: any;
  Grupa: any;
}

@Component({
  selector: "app-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.scss"],
})
export class ConfigComponent implements OnInit {
  @ViewChild(DxFormComponent, { static: false }) form:
    | DxFormComponent
    | undefined;
  @ViewChild(DxTreeListComponent, { static: false }) treeList:
    | DxTreeListComponent
    | undefined;

  @Input() setting: string = "";
  @Input() treeHeight: number = 0;

  addButtonOptions: any;
  closeButtonOptions: any;
  dbData: any;
  editButtonOptions: any;
  editPopupVisible: boolean = false;
  editSettings: any = [];
  items: any[] = [];
  loading: boolean = false;
  newItem: NewItem = new NewItem();
  editItem?: any;
  popupVisible: boolean = false;
  saving: boolean = false;
  settings: any[] = [];
  title: string = "";
  treeViewPadding: number;
  treeViewWidth: number;

  constructor(
    private db: DbService,
    public dialog: MatDialog,
    private layoutService: LayoutService
  ) {
    const _this: any = this;
    this.onReorder = this.onReorder.bind(this);

    this.treeViewPadding = 200;
    this.treeViewWidth =
      this.layoutService.getResolution().w -
      this.layoutService.getMenuWidth() -
      this.treeViewPadding;

    this.addButtonOptions = {
      icon: "check",
      text: "Dodaj",
      onClick: function (): void {
        if (_this.form) {
          const validationStatus: any = _this.form.instance.validate();
          if (validationStatus.isValid) {
            const id: any = uuidv4();
            if (_this.newItem.Grupa) {
              _this.settings.push({
                id: id,
                name: _this.newItem.Naziv,
                parent: _this.newItem.Grupa,
              });
            } else {
              _this.settings.push({
                id: id,
                name: _this.newItem.Naziv,
                parent: null,
              });
            }

            _this.popupVisible = false;
          }
        }
      },
    };

    this.editButtonOptions = {
      icon: "check",
      text: "Spremi",
      onClick: function (): void {
        if (_this.form) {
          const validationStatus: any = _this.form.instance.validate();
          const items = [..._this.settings].filter(
            (i) => i.id !== _this.editItem.Id
          );
          if (validationStatus.isValid) {
            items.push({
              id: _this.editItem.Id,
              name: _this.editItem.Naziv,
              parent: _this.editItem.Grupa ?? null,
            });

            _this.settings = items;
            _this.editPopupVisible = false;
          }
        }
      },
    };

    this.closeButtonOptions = {
      icon: "close",
      text: "Odustani",
      onClick: function (): void {
        _this.popupVisible = false;
        _this.editPopupVisible = false;
      },
    };
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    switch (this.setting) {
      case "Muscles":
        this.title = "Mi??i??";
        break;
      case "Props":
        this.title = "Rekvizit";
        break;
      case "PropsTraining":
        this.title = "Rekvizit";
        break;
      case "Trainers":
        this.title = "Trena??er";
        break;
    }

    this.dbData = (await this.db.getCollectionDocuments(this.setting)).sort(
      (a: any, b: any) => a.order - b.order
    );

    const data: any[] = [];
    this.dbData.forEach((i: any) => {
      data.push({ id: i.id, name: i.name, order: i.order, parent: null });
      if (i.children && i.children.length > 0) {
        i.children.forEach((j: any) => {
          data.push({
            id: j.id,
            name: j.name,
            order: j.order,
            parent: this.getParent(i.name).id,
          });
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
          _this.editSettings = _this.settings.filter((i: any) => !i.parent);
          _this.popupVisible = true;
        },
      },
      location: "after",
    });
  }

  async onDelete(data: any): Promise<void> {
    this.openDialog(data);
  }

  onEdit(data: any): void {
    let group = null;

    if (data.parent) {
      group = data.parent;
    }

    this.editItem = { Id: data.id, Naziv: data.name, Grupa: group };
    this.editSettings = this.settings.filter((i) => !i.parent);

    this.editPopupVisible = true;
  }

  async save(): Promise<void> {
    if (this.settings && this.settings.length > 0) {
      this.saving = true;

      let idx: number = 1;
      for (const setting of this.settings) {
        if (setting.parent === null) {
          setting.order = idx;
          idx++;
          let children: any[] = this.settings.filter(
            (i) => i.parent === setting.id
          );
          if (children.length > 0) {
            for (let jdx = 0; jdx < children.length; jdx++) {
              children[jdx].order = jdx + 1;
            }
          }
          setting.children = children;
          await this.db.saveCollectionDocument(this.setting, setting);
        }
      }

      this.saving = false;
    }
  }

  getKey(rowData: any): string {
    return `${rowData.id}`;
  }

  getParent(name: string) {
    const parent = this.dbData.find(
      (i: any) => i.parent === null && i.name === name
    );

    if (parent) {
      return parent;
    }

    return null;
  }

  openDialog(setting: any): void {
    const dialogRef: any = this.dialog.open(ConfirmationDialogComponent, {
      width: "250px",
      data: setting,
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        await this.db.deleteCollectionDocument(this.setting, setting);
        this.dbData = this.dbData.filter((i: any) => i.id !== setting.id);
        this.settings = this.settings.filter((i: any) => i.id !== setting.id);
        this.items = this.items.filter((i: any) => i.id !== setting.id);
      }
    });
  }
}
