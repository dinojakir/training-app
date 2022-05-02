import { Component, OnInit } from "@angular/core";
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
import { Training } from "src/app/model/training.dto";
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
  selector: "app-add-training",
  templateUrl: "./add-training.component.html",
  styleUrls: ["./add-training.component.scss"],
})
export class AddTrainingComponent implements OnInit {
  edit: Training | undefined;
  editMode: boolean = false;
  errorStateMatcher = new CustomErrorStateMatcher();
  loading: boolean = false;
  nameFormControl = new FormControl("", [Validators.required]);
  saving: boolean = false;
  training: Training = new Training();
  trainingForm: FormGroup;

  _this: any;

  constructor(
    private db: DbService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.trainingForm = this.formBuilder.group({
      name: this.nameFormControl,
    });

    this.onSubmit = this.onSubmit.bind(this);
    this._this = this;
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    if (history.state.data) {
      this.editMode = true;
      const training: Training = history.state.data;
      this.edit = new Training();
      this.edit.id = training.id;
      this.edit.name = training.name;
      this.nameFormControl.setValue(training.name);

      this.edit.comment = training.comment;

      this.training = this.edit;
    }

    this.loading = false;
  }

  onNameChanged(e: any): void {
    this.training.name = e.target.value;
  }

  async onSubmit(e: any, _this: any, uuid: any): Promise<void> {
    if (!_this.trainingForm.valid) {
      return;
    }

    _this.saving = true;

    if (!_this.editMode) {
      _this.training.id = uuid;
    }

    await _this.db.saveCollectionDocument("Trainings", _this.training);

    _this.saving = false;
    _this.router.navigate(["pocetna"]);
  }

  getUuid() {
    return uuidv4();
  }
}
