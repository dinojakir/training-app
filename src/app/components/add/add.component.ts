import { isNgTemplate } from "@angular/compiler";
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
import { Router } from "@angular/router";
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
  editMode: boolean = false;
  exercise: Exercise = new Exercise();
  edit: Exercise | undefined;
  file: any;
  uploadPercent: number | undefined;

  muscles: any[] = [];
  submuscles: any[] = [];
  props: any[] = [];
  subprops: any[] = [];
  trainers: any[] = [];
  subtrainers: any[] = [];

  nameFormControl = new FormControl("", [Validators.required]);
  propsFormControl = new FormControl("", []);
  subpropsFormControl = new FormControl("", []);
  trainersFormControl = new FormControl("", []);
  subtrainersFormControl = new FormControl("", []);
  exerciseForm: FormGroup;
  selectedMuscles: any;
  treeBoxValue: string[] = [];

  errorStateMatcher = new CustomErrorStateMatcher();

  loading: boolean = false;
  saving: boolean = false;

  constructor(
    private db: DbService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.exerciseForm = this.formBuilder.group({
      name: this.nameFormControl,
      props: this.propsFormControl,
      subprops: this.subpropsFormControl,
      trainers: this.trainersFormControl,
      subtrainers: this.subtrainersFormControl,
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    this.muscles = (await this.db.getCollectionDocuments("Muscles")).sort(
      (a: any, b: any) => a.order - b.order
    );
    this.props = (await this.db.getCollectionDocuments("Props")).sort(
      (a: any, b: any) => a.order - b.order
    );
    this.trainers = (await this.db.getCollectionDocuments("Trainers")).sort(
      (a: any, b: any) => a.order - b.order
    );

    if (history.state.data) {
      this.editMode = true;
      const exercise: Exercise = history.state.data;
      this.edit = new Exercise();

      this.edit.id = exercise.id;
      this.edit.name = exercise.name;
      this.nameFormControl.setValue(exercise.name);
      this.edit.type = exercise.type;
      this.edit.muscle = exercise.muscle;
      if (this.edit && this.edit.muscle) {
        const muscle: any = this.muscles.find(
          (i) => i.item === this.edit?.muscle
        );
        if (muscle.children) {
          this.submuscles = muscle.children;
        } else {
          this.submuscles = [];
        }
      }
      this.edit.submuscle = exercise.submuscle;
      this.edit.muscles = exercise.muscles;
      this.treeBoxValue = exercise.muscles;
      this.edit.video = exercise.video;
      this.edit.mode = exercise.mode;
      this.edit.comment = exercise.comment;
      if (exercise.mode.name === "props") {
        if (exercise.mode.item) {
          this.propsFormControl.setValue(exercise.mode.item.name);

          const prop: any = this.props.find(
            (i) => i.item === exercise.mode.item?.name
          );
          if (prop.children) {
            this.subprops = prop.children;
          } else {
            this.subprops = [];
          }

          if (this.exercise.mode.item?.subItem) {
            this.subpropsFormControl.setValue(exercise.mode.item.subItem);
          }
        }
      }

      if (exercise.mode.name === "trainer") {
        if (exercise.mode.item) {
          this.trainersFormControl.setValue(exercise.mode.item.name);

          const trainer: any = this.trainers.find(
            (i) => i.item === exercise.mode.item?.name
          );
          if (trainer.children) {
            this.subtrainers = trainer.children;
          } else {
            this.subtrainers = [];
          }

          if (exercise.mode.item?.subItem) {
            this.subtrainersFormControl.setValue(exercise.mode.item.subItem);
          }
        }
      }

      this.exercise = this.edit;
    }

    this.loading = false;
  }

  onButtonGroupChange(e: any): void {
    this.exercise.mode = { name: e.value };
  }

  onDropDownBoxValueChanged(e: any): void {
    // tODO
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

    this.saving = true;

    if (!this.editMode) {
      this.exercise.id = uuidv4();
    }
    this.exercise.muscles = this.treeBoxValue;

    if (this.file && this.file.name) {
      const filePath: string = `Videos/${this.file.name}`;
      const fileRef: AngularFireStorageReference = this.storage.ref(filePath);

      if (this.editMode && this.edit?.video) {
        await this.storage.refFromURL(this.edit?.video).delete().toPromise();
      }
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

    this.saving = false;

    this.router.navigate(["pocetna"]);
  }

  onItemRendered(e: any): void {
    if (e.node.items.length !== 0) {
      e.itemElement.parentNode.getElementsByClassName(
        "dx-checkbox"
      )[0].style.visibility = "hidden";
    }
  }

  onTreeViewSelectionChanged(e: any): void {
    this.treeBoxValue = e.component.getSelectedNodeKeys();
    if (e.itemData.hasOwnProperty("parent")) {
      const item: any = e.itemData;
      const parent: any = item.parent;
      if (e.itemData.selected) {
        if (this.treeBoxValue.findIndex((i) => i === parent) < 0) {
          e.component.selectItem(parent);
        }
      } else {
        const children: any = this.muscles.find(
          (i) => i.id === parent
        ).children;

        let found: boolean = false;
        for (const child of children) {
          if (child.id !== item.id) {
            if (this.treeBoxValue.findIndex((j) => j === child.id) >= 0) {
              found = true;
              break;
            }
          }
        }

        if (!found) {
          e.component.unselectItem(parent);
        }
      }
    }
  }

  onTreeViewReady(e: any): void {
    this.updateSelection(e.component);
  }

  updateSelection(treeView: any): void {
    if (!treeView) {
      return;
    }

    if (!this.treeBoxValue) {
      treeView.unselectAll();
    }

    if (this.treeBoxValue) {
      this.treeBoxValue.forEach(
        function (value: any): void {
          treeView.selectItem(value);
        }.bind(this)
      );
    }
  }
}
