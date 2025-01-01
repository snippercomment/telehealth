import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [MatDialogModule,CommonModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.css'
})
export class DeleteComponent {
  constructor(
      public dialogRef: MatDialogRef<DeleteComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { itemName: string }
    ) {}
  
    onCancel(): void {
      this.dialogRef.close(false);
    }
  
    onConfirm(): void {
      this.dialogRef.close(true);
    }
}
