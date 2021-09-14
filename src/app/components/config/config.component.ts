import { Component, OnInit } from "@angular/core";
import { DbService } from "src/app/services/auth/db.service";
import { v4 as uuidv4 } from "uuid";

@Component({
  selector: "app-config",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.scss"],
})
export class ConfigComponent implements OnInit {
  muscles: any[] = [];
  savingMuscles: boolean = false;

  constructor(private db: DbService) {
    this.onReorder = this.onReorder.bind(this);
  }

  async ngOnInit(): Promise<void> {
    const muscles: any[] = await this.db.getCollectionDocuments("Muscles");
    console.log(muscles);

    const data: any[] = [];
    muscles.forEach((i: any) => {
      data.push({ name: i.item, parent: null });
      if (i.children && i.children.length > 0) {
        i.children.forEach((j: any) => {
          data.push({ name: j.item, parent: i.item });
        });
      }
    });

    this.muscles = data;
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
      const sourceIndex: any = this.muscles.indexOf(source);
      this.muscles.splice(sourceIndex, 1);

      const targetIndex: any = this.muscles.indexOf(targetData) + 1;
      this.muscles.splice(targetIndex, 0, source);
    }
  }

  async saveMuscles(): Promise<void> {
    if (this.muscles && this.muscles.length > 0) {
      this.savingMuscles = true;

      const muscles: any[] = await this.db.getCollectionDocuments("muscles-db");
      for (const muscle of muscles) {
        if (muscle.id) {
          await this.db.deleteCollectionDocument("muscles-db", muscle);
        }
      }

      for (const muscle of this.muscles) {
        if (muscle.parent === null) {
          const id: any = uuidv4();
          let children: any[] = this.muscles.filter(
            (i) => i.parent === muscle.name
          );
          if (children.length > 0) {
            children = children.map((i) => {
              return { item: i.name };
            });
          }
          const newMuscle: any = {
            id: id,
            item: muscle.name,
            children: children,
          };
          await this.db.saveCollectionDocument("muscles-db", newMuscle);
        }
      }

      this.savingMuscles = false;
    }
  }

  getKey(rowData: any): string {
    return rowData.parent
      ? `${rowData.parent}-${rowData.name}`
      : `${rowData.name}`;
  }
}
