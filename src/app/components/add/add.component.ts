import { Component, OnInit } from "@angular/core";
import { Exercise } from "src/app/model/exercise.dto";
import { DbService } from "src/app/services/auth/db.service";
import {
  AngularFireStorage,
  AngularFireStorageReference,
  AngularFireUploadTask,
} from "@angular/fire/storage";

@Component({
  selector: "app-add",
  templateUrl: "./add.component.html",
  styleUrls: ["./add.component.scss"],
})
export class AddComponent implements OnInit {
  exercise: Exercise = new Exercise();
  file: any;
  uploadPercent: any;

  muscles: any[] = [];
  submuscles: any[] = [];
  props: any[] = [];
  subprops: any[] = [];
  trainers: any[] = [];
  subtrainers: any[] = [];

  constructor(private db: DbService, private storage: AngularFireStorage) {}

  async ngOnInit(): Promise<void> {
    this.muscles = await this.db.getCollectionDocuments("Muscles");
    this.props = await this.db.getCollectionDocuments("Props");
    this.trainers = await this.db.getCollectionDocuments("Trainers");
  }

  onFileSelected(e: any): void {
    this.file = e.target.files[0];
  }

  onSelectMuscle(e: any): void {
    const muscle: any = this.muscles.find((i) => i.item === e.value);
    if (muscle && muscle.children) {
      this.submuscles = muscle.children;
    } else {
      this.submuscles = [];
    }
  }

  async onSaveClick(): Promise<void> {
    if (this.file) {
      const filePath: string = `Videos/${this.file.name}`;
      const fileRef: AngularFireStorageReference = this.storage.ref(filePath);
      const task: AngularFireUploadTask = this.storage.upload(
        filePath,
        this.file
      );
      this.uploadPercent = task.percentageChanges();
      await task;
      const url: any = await fileRef.getDownloadURL().toPromise();
      this.exercise.video = url;
    }

    this.exercise.id = this.exercise.name;
    await this.db.saveCollectionDocument("Exercises", this.exercise);
  }
}
