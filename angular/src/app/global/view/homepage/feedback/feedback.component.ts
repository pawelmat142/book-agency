import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TextareaElementComponent } from '../../../controls/textarea-element/textarea-element.component';
import { FeedbackService } from './feedback-service';
import { take } from 'rxjs';
import { Dialog } from '../../../nav/dialog.service';
import { CourtineService } from '../../../nav/courtine.service';
import { ButtonModule } from 'primeng/button';
import { $desktop } from '../../../tools/media-query';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    CommonModule,
    TextareaElementComponent,
    ButtonModule,
  ],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
})
export class FeedbackComponent {

  $desktop = $desktop;

  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly dialog: Dialog,
    private readonly courtine: CourtineService,
  ) {}

  value = ''

  _onInput(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.value = input.value
  }

  _send() {
    if (!this.value) {
      return
    }
    this.courtine.startCourtine()
    this.feedbackService.send$(this.value).pipe(
      take(1),
    ).subscribe({
      next: () => {
        this.value = ''
        this.courtine.stopCourtine()
        this.dialog.simplePopup(`Thanks! It's realy helpful :)`)
      },
      error: error => {
        this.courtine.stopCourtine()
        this.dialog.errorPopup(error)
      }
    })
  }

}
