import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BtnComponent } from '../../../../pages/controls/btn/btn.component';

export interface DialogData {
  header: string
  content?: string[]
  isError?: boolean
  error?: Error
  buttons?: DialogBtn[] 
}

export interface DialogBtn {
  label: string
  class?: string
  onclick?: () => any
}

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [
    CommonModule,
    BtnComponent,
],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PopupComponent {

  constructor(
    private readonly dialogRef: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}
  
  _defaultButton = true

  ngOnInit(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      if (this.data.error) {
        console.error(this.data.error)
      }
    })
    this._defaultButton = !this.data.buttons?.length
  }



  _close() {
    this.dialogRef.close()
  }

  _onBtnClick(btn: DialogBtn) {
    this._close()
    if (btn.onclick) {
      btn.onclick()
    }
  }

}