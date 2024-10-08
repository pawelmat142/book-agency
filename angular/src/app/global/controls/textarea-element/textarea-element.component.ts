import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-textarea-element',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './textarea-element.component.html',
  styleUrl: './textarea-element.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class TextareaElementComponent {

  @Output() onInput = new EventEmitter<Event>()

  @Input() value: string = ''

  @Input() disabled? = false
  @Input() placeholder? = ''

  @Input() rowsInitial = 3

  @ViewChild('textareaRef') textareaRef!: ElementRef

  focusTextarea() {
    this.textareaRef.nativeElement.focus()
  }

  ngAfterViewInit(): void {
    this.resize()
  }

  _onInput($event: Event) {
    this.onInput.emit($event)
    this.resize()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      setTimeout(() => {
        this.resize()
      }, 100)
    }
  }

  private resize() {
    const textarea = this.textareaRef.nativeElement
    textarea.style.height = 'auto'
    const height = textarea.scrollHeight
    textarea.style.height = `${height}px`
  }

}
