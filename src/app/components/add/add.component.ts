import { Component, OnInit } from "@angular/core";
import {
  AngularFireStorage,
  AngularFireStorageReference,
  AngularFireUploadTask,
} from "@angular/fire/storage";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { Exercise } from "src/app/model/exercise.dto";
import { DbService } from "src/app/services/auth/db.service";
import { v4 as uuidv4 } from "uuid";

export class CustomErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted: any = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: "app-add",
  templateUrl: "./add.component.html",
  styleUrls: ["./add.component.scss"],
})
export class AddComponent implements OnInit {
  exercise: Exercise = new Exercise();
  file: any;
  uploadPercent: number | undefined;

  muscles: any[] = [];
  submuscles: any[] = [];
  props: any[] = [];
  subprops: any[] = [];
  trainers: any[] = [];
  subtrainers: any[] = [];

  nameFormControl = new FormControl("", [Validators.required]);
  exerciseForm: FormGroup;

  errorStateMatcher = new CustomErrorStateMatcher();

  submitting: boolean = false;

  constructor(
    private db: DbService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage
  ) {
    this.exerciseForm = this.formBuilder.group({
      name: this.nameFormControl,
    });
  }

  async ngOnInit(): Promise<void> {
    this.muscles = await this.db.getCollectionDocuments("Muscles");
    this.props = await this.db.getCollectionDocuments("Props");
    this.trainers = await this.db.getCollectionDocuments("Trainers");

    if (history.state.data) {
      console.log(history.state.data);
      this.exercise = history.state.data;
      this.nameFormControl.setValue(this.exercise.name);
    }
  }

  onButtonGroupChange(e: any): void {
    this.exercise.mode = { name: e.value };
  }

  onFileSelected(e: any): void {
    this.file = e.target.files[0];
  }

  onNameChanged(e: any): void {
    this.exercise.name = e.target.value;
  }

  onSelectMuscle(e: any): void {
    const muscle: any = this.muscles.find((i) => i.item === e.value);
    if (muscle.children) {
      this.submuscles = muscle.children;
    } else {
      this.submuscles = [];
    }
  }

  onSelectProp(e: any): void {
    this.exercise.mode.item = { name: e.value };
    const prop: any = this.props.find((i) => i.item === e.value);
    if (prop.children) {
      this.subprops = prop.children;
    } else {
      this.subprops = [];
    }
  }

  onSelectSubprop(e: any): void {
    if (this.exercise.mode.item) {
      this.exercise.mode.item!.subItem = e.value;
    }
  }

  onSelectTrainer(e: any): void {
    this.exercise.mode.item = { name: e.value };
    const trainer: any = this.trainers.find((i) => i.item === e.value);
    if (trainer.children) {
      this.subtrainers = trainer.children;
    } else {
      this.subtrainers = [];
    }
  }

  onSelectSubtrainer(e: any): void {
    if (this.exercise.mode.item) {
      this.exercise.mode.item!.subItem = e.value;
    }
  }

  async submit(): Promise<void> {
    if (!this.exerciseForm.valid) {
      return;
    }

    this.submitting = true;

    this.exercise.id = uuidv4();

    if (this.file && this.file.name) {
      const filePath: string = `Videos/${this.file.name}`;
      const fileRef: AngularFireStorageReference = this.storage.ref(filePath);
      const task: AngularFireUploadTask = this.storage.upload(
        filePath,
        this.file
      );
      task.percentageChanges().subscribe((value) => {
        this.uploadPercent = value;
      });
      await task;
      const url: any = await fileRef.getDownloadURL().toPromise();
      this.exercise.video = url;
    }

    await this.db.saveCollectionDocument("Exercises", this.exercise);

    this.submitting = false;
  }
}
