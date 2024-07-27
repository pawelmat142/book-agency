import { Component, forwardRef } from '@angular/core';
import { AbstractControlComponent } from '../abstract-control/abstract-control.component';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent ),
      multi: true
    }
  ]
})
export class TextareaComponent extends AbstractControlComponent<string> {

  override get _EMPTY_VALUE(): string { return '' }

  _onInput($event: Event) {
    const input = $event.target as HTMLInputElement;
    this.updateValue(input.value)
  }

}
