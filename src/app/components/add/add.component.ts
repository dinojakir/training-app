import { Component, OnInit } from "@angular/core";
import { Exercise } from "src/app/model/exercise.dto";
import { DbService } from "src/app/services/auth/db.service";

@Component({
  selector: "app-add",
  templateUrl: "./add.component.html",
  styleUrls: ["./add.component.scss"],
})
export class AddComponent implements OnInit {
  exercise: Exercise = new Exercise();
  muscles: any[] = [];
  submuscles: any[] = [];

  constructor(private db: DbService) {}

  async ngOnInit(): Promise<void> {
    this.muscles = await this.db.getCollectionDocuments("Muscles");
  }

  onFileSelected() {}

  onSelectMuscle(e: any): void {
    const muscle: any = this.muscles.find((i) => i.item === e.value);
    if (muscle && muscle.children) {
      this.submuscles = muscle.children;
    } else {
      this.submuscles = [];
    }
  }

  async onSaveClick(): Promise<void> {
    this.exercise.id = this.exercise.name;
    console.log(this.exercise);
  }
}
