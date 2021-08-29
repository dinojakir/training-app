import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

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

  constructor(private db: AngularFirestore) {}

  ngOnInit(): void {}

  onFileSelected() {}

  onSelectMuscle(e: any) {
    this.selectionDisabled = false;
  }

  async onSaveClick() {}
}
