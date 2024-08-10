import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { ControlComponent } from '../control/control.component';
import { BtnComponent } from '../../pages/controls/btn/btn.component';
import { GroupComponent } from '../group/group.component';
import { ArrayComponent } from "../array/array.component";
import { pForm, pFormArray, pFormStep } from '../form-processor.service';
import { AppState } from '../../store/app.state';
import { Store } from '@ngrx/store';
import { skip, Subscription, take } from 'rxjs';
import { dataChange, FormType, loadingChange, openForm, selectFormId, startForm, storeForm } from '../form.state';
import { FormUtil } from '../../utils/form.util';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-form-processor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ControlComponent,
    BtnComponent,
    GroupComponent,
    ArrayComponent,
    ProgressSpinnerModule
],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ],
  templateUrl: './form-processor.component.html',
  encapsulation: ViewEncapsulation.None
})
export class FormProcessorComponent {

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store<AppState>,
  ) {}

  @Input() form!: pForm
  formGroup = new FormGroup({})

  stepIndex = 0
  step?: pFormStep

  subscriptions: Subscription[] = []

  isLoading$ = this.store.select(loadingChange).pipe(skip(1))

  rebuildDetector = 0

  formData?: any

  ngOnInit(): void {
    
    this.subscriptions.push(this.store.select(dataChange).pipe(
      skip(1),
    ).subscribe(x => {
      console.log('formData')
      console.log(x)
      this.formData = x
      this.recreateArrayStepGroups()
      FormUtil.setFormValues(this.formGroup, this.formData)
      this.rebuildDetector++
    }))
    this.store.dispatch(openForm({ formType: FormType.BOOKING }))

    this.buildFormGroup()
    this.setStep()
  }

  private recreated = false

  private recreateArrayStepGroups() {
    console.log('recreateArrayStepGroups')
    if (this.recreated) {
      return
    }
    this.recreated = true
    if (this.formData) {
      this.form.steps.forEach(step => {
        if (step.array) {
          const stepData = this.formData[FormUtil.toCamelCase(step.name)]
          if (Array.isArray(stepData)) {
            const stepGroups = stepData.map((data, i) => step.getGroup(i))
            step.groups = stepGroups
          }
        }
      })
    }
    this.buildFormGroup()
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  // TODO
  test() {
    console.log(this.formGroup.value)
    console.log(this.formData)
  }


  _next() {
    const currentStepForm = this.currentStepForm
    if (currentStepForm) {
      if (currentStepForm?.valid) {
        this.startOrStoreFormAction()
        this.stepIndex++
        this.setStep()
      } else {
        FormUtil.markForm(currentStepForm)
      }
    }
  }

  _submit() {
    console.log(this.formGroup.valid)
    if (this.formGroup.valid) {
      this.startOrStoreFormAction()
      console.log(this.formGroup.value)
    }
  }

  _back() {
    const currentStepForm = this.currentStepForm
    if (currentStepForm) {
      if (currentStepForm?.valid) {
        this.startOrStoreFormAction()
      }
    }
    this.stepIndex--
    this.setStep()
  }

  _addToArray(stepName: string) {
    const step = this.form.steps.find(s => s.name === stepName)
    if (!step) {
      throw new Error(`not found step ${stepName}`)
    }
    
    if (!step?.array || !step.getGroup) {
      throw new Error(`step ${stepName} is not an array`)
    }

    const newName = Math.max(...step.groups.map(g => Number(g.name))) + 1
    const newGroup = step.getGroup(newName)
    step.groups.push(newGroup)
    this.rebuildDetector++
    this.startOrStoreFormAction()
    
    this.buildFormGroup()
    FormUtil.setFormValues(this.formGroup, this.formData)
  }


  _removeFromArray(stepName: string) {
    const step = this.form.steps.find(s => s.name === stepName)
    if (!step?.array) {
      throw new Error(`Step ${stepName} is not an array`)
    }
    this.rebuildDetector++
    console.log(step.groups)
    this.buildFormGroup()
    FormUtil.setFormValues(this.formGroup, this.formData)
  }

  _removeActive = false
  private setStep() {
    this.step = this.form.steps[this.stepIndex]
    if (this.step.array) {
      this._removeActive = !!this.step.groups.length
    }
  }


  private get currentStepForm(): FormGroup | FormArray | null {
    if (this.step) {
      const controlName = FormUtil.toCamelCase(this.step?.name)
      const stepForm = this.formGroup.get(controlName)
      if (stepForm instanceof FormGroup || stepForm instanceof FormArray) {
        return stepForm
      }
    }
    return null
  }


  private buildFormGroup() {
    console.log('build form group')
    
    const formGroup = new FormGroup({})

    this.form.steps.forEach(step => {

      if (step.array) {
        const arrayGroups = this.prepareStepFormArrayGroups(step)
        formGroup.addControl(FormUtil.toCamelCase(step.name), this.fb.array(arrayGroups))

      } else {

        const stepFormGroup = new FormGroup({})
        step.controls.forEach(control => {
          stepFormGroup.addControl(FormUtil.toCamelCase(control.name), FormUtil.prepareFormControl(control))
        })
        formGroup.addControl(FormUtil.toCamelCase(step.name), stepFormGroup)
      }

    })

    this.formGroup = formGroup
  }

  private prepareStepFormArrayGroups(step: pFormArray): FormGroup[] {
    const groups = step.groups.map((group, i) => {
      const formArrayGroup = new FormGroup({})
      group.controls.forEach(control => {
        formArrayGroup.addControl(FormUtil.toCamelCase(control.name), FormUtil.prepareFormControl(control))
      })
      return formArrayGroup
    })
    return groups
  }




  private startOrStoreFormAction() {
    const formdata = this.formGroup.value
    const formId = this.getFormId()
    if (formId) {
      this.store.dispatch(storeForm(formdata))
    } else {
      this.store.dispatch(startForm(formdata))
    }
  }

  private getFormId(): string {
    let id: string = ''
    this.store.select(selectFormId).pipe(take(1)).subscribe(_id => id = _id);
    return id;
  }
}