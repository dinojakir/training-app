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
  errorStateMatcher = new CustomErrorStateMatcher();
  exerciseForm: FormGroup;
  file: any;
  loading: boolean = false;
  muscles: any[] = [];
  nameFormControl = new FormControl("", [Validators.required]);
  submuscles: any[] = [];
  props: any[] = [];
  propsFormControl = new FormControl("", []);
  saving: boolean = false;
  selectedMuscles: any[] = [];
  subprops: any[] = [];
  subpropsFormControl = new FormControl("", []);
  subtrainers: any[] = [];
  subtrainersFormControl = new FormControl("", []);
  trainers: any[] = [];
  trainersFormControl = new FormControl("", []);
  treeBoxValue: string = "...";
  uploadPercent: number | undefined;
  _this: any;

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

    this.onSubmit = this.onSubmit.bind(this);
    this._this = this;
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
      this.edit.muscles = exercise.muscles;
      this.selectedMuscles = exercise.muscles;

      for (let idx = 0; idx < exercise?.muscles?.length; idx++) {
        this.checkMuscle(exercise.muscles[idx]);
      }

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

  onFileSelected(e: any): void {
    this.file = e.target.files[0];
  }

  onItemRendered(e: any): void {
    if (e.node.items.length !== 0) {
      e.itemElement.parentNode.getElementsByClassName(
        "dx-checkbox"
      )[0].style.visibility = "hidden";
    }
  }

  onNameChanged(e: any): void {
    this.exercise.name = e.target.value;
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

  onSelectSubtrainer(e: any): void {
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

  async onSubmit(e: any, _this: any, uuid: any): Promise<void> {
    if (!_this.exerciseForm.valid) {
      return;
    }

    _this.saving = true;

    if (!_this.editMode) {
      _this.exercise.id = uuid;
    }

    _this.exercise.muscles = _this.selectedMuscles;
    _this.exercise.muscles[0].muscleGroup = _this.muscles.find(
      (i: any) => i.id === _this.selectedMuscles[0].parent
    ).name;

    if (_this.file && _this.file.name) {
      const filePath: string = `Videos/${_this.file.name}`;
      const fileRef: AngularFireStorageReference = _this.storage.ref(filePath);

      if (_this.editMode && _this.edit?.video) {
        await _this.storage.refFromURL(_this.edit?.video).delete().toPromise();
      }
      const task: AngularFireUploadTask = _this.storage.upload(
        filePath,
        _this.file
      );
      task.percentageChanges().subscribe((value) => {
        _this.uploadPercent = value;
      });
      await task;
      const url: any = await fileRef.getDownloadURL().toPromise();
      _this.exercise.video = url;
    }

    await _this.db.saveCollectionDocument("Exercises", _this.exercise);

    _this.saving = false;
    _this.router.navigate(["pocetna"]);
  }

  onTreeViewSelectionChanged(e: any): void {
    if (e.itemData.selected) {
      if (e.itemData.hasOwnProperty("parent") && e.itemData.parent) {
        this.selectedMuscles.push({
          parent: e.itemData.parent,
          children: [e.itemData.id],
        });
      } else {
        this.selectedMuscles.push({
          parent: e.itemData.id,
          children: [],
        });
      }
    } else {
      if (e.itemData.hasOwnProperty("parent") && e.itemData.parent) {
        this.selectedMuscles = this.selectedMuscles.filter(
          (i) => i.parent !== e.itemData.parent
        );
      } else {
        const parent = this.selectedMuscles.find(
          (i) => i.parent !== e.itemData.parent
        );

        if (parent) {
          parent.children = parent.children.filter(
            (j: any) => j !== e.itemData.id
          );
        }
      }
    }
  }

  checkMuscle(muscle: any) {
    const item = this.muscles.find((i: any) => i.id === muscle.parent);

    if (item) {
      if (muscle?.children?.length > 0) {
        for (let idx = 0; idx < muscle.children.length; idx++) {
          const child = item.children.find(
            (j: any) => j.id === muscle.children[idx]
          );
          if (child) {
            item.expanded = true;
            child.selected = true;
          }
        }
      } else {
        item.selected = true;
      }
    }
  }

  getUuid() {
    return uuidv4();
  }
}
