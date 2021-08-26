import { Component, OnInit } from '@angular/core';

interface Muscle {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit {
  selectedMuscle: Muscle | undefined;
  selectionDisabled: boolean = true;
  muscles: Muscle[] = [
    { value: 'neck', viewValue: 'Neck' },
    { value: 'shoulders', viewValue: 'Shoulders' },
    { value: 'upper-arms', viewValue: 'Upper Arms' },
  ];

  constructor() {}

  ngOnInit(): void {}

  onFileSelected() {}

  onSelectMuscle(e: any) {
    this.selectionDisabled = false;
  }

  onSaveClick() {}
}
