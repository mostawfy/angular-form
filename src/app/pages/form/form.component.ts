import { Component, effect, inject, OnDestroy, OnInit, TemplateRef, viewChild } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormStore, FormValue } from './form.store';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ 
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatSelectModule, MatCheckboxModule, FlexModule, MatButtonModule,
    MatDialogModule, RouterModule
  ],
  providers: [ FormStore ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit, OnDestroy {

  fb = inject( FormBuilder );
  snackbar = inject( MatSnackBar );
  dialog = inject( MatDialog );

  formStore = inject(FormStore);

  canUndo = this.formStore.canUndo;
  canRedo = this.formStore.canRedo;

  updatedForm = this.formStore.updatedForm;

  constructor() {
    effect(() => {
      if ( this.updatedForm() ) {
        this.form.patchValue({...this.updatedForm() }, { emitEvent: false });
      }
    })
   }

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    gender: ['', Validators.required],
    age: [0, [Validators.required, Validators.min(18)]],
    termsConfirm: [false, Validators.requiredTrue]
  });

  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get gender() { return this.form.get('gender'); }
  get age() { return this.form.get('age'); }
  get termsConfirm() { return this.form.get('termsConfirm'); }

  formValueChangesSubscription: Subscription;

  ngOnInit() {
    this.formValueChangesSubscription = this.form.valueChanges.subscribe(value => {
      this.formStore.updateForm(value as FormValue);
    });
  }

  // Revert the most recent change made by the user
  undo() {
    this.formStore.undo();
    this.snackbar.open('Form has been reset to previous state', 'Close', { duration: 500 });
  }

  // Revert the most recent undo operation
  redo() {
    this.formStore.redo();
    this.snackbar.open('Form has been reset to next state', 'Close', { duration: 500 });
  }

  // Reset the form to its initial state
  reset() {
    this.formStore.resetForm();
    this.form.reset();
  }

  // open a success dialog when the form is submitted and valid
  submit() {
    if ( this.form.invalid ) {
      this.snackbar.open('Please fill in the form correctly', 'Close');
      return;
    }

    this.openSuccessDialog();
  }

  successDialog = viewChild.required<TemplateRef<any>>('successDialog');
  openSuccessDialog() {
    this.dialog.open(this.successDialog(), {
      width: '350px',
      disableClose: true
    }).afterClosed().subscribe((result) => {
      if ( result === 'reset' ) this.reset();
    });
  }

  ngOnDestroy() {
    if (this.formValueChangesSubscription) {
      this.formValueChangesSubscription.unsubscribe();
    }
  }


}
