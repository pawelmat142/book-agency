import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconButtonComponent } from '../icon-button/icon-button.component';

@Component({
  selector: 'app-mock-card',
  standalone: true,
  imports: [
    CommonModule,
    IconButtonComponent,
  ],
  templateUrl: './mock-card.component.html',
  styleUrl: './mock-card.component.scss'
})
export class MockCardComponent {

  @Input() message?: string

  @Output() close = new EventEmitter<void>()

}
