import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, HostListener, Input, Output, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ArtistMediaCode } from '../../../services/artist/artist-medias/artist-medias.service';
import { IconButtonComponent } from "../../components/icon-button/icon-button.component";
import { AbstractControlComponent } from '../abstract-control/abstract-control.component';


export interface SelectorItem {
  code: string
  name: string
  imgUrl?: string
  svg?: ArtistMediaCode
}

@Component({
  selector: 'app-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconButtonComponent,
],
  templateUrl: './selector.component.html',
  styleUrl: './selector.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorComponent),
      multi: true
    }
  ]
})
export class SelectorComponent extends AbstractControlComponent<string> {


  override ngOnInit(): void {
    super.ngOnInit()
    if (this.value) {
      this._item = this.items.find(i => i.code === this.value) || null
    }
    this.filterItems()
  }

  _onInput($event: Event) {
    const input = $event.target as HTMLInputElement;
    this.value = input.value
    this.filterItems(input.value)
  }

  @Input() items!: SelectorItem[]
  _items: SelectorItem[] = []
  @Input() itemsLength = 10
  @Input() chachedImg = false

  _item: SelectorItem | null = null

  @Output() select = new EventEmitter<SelectorItem>()

  _select(item: SelectorItem, event: MouseEvent) {
    event.stopPropagation()
    event.preventDefault()
    this.updateValue(item.name)
    this.select.emit(item)
    this.onBlur()
  }

  private filterItems(inputString?: string) {
    if (inputString) {
      this._items = this.items.filter(i => i.name.toLocaleLowerCase().startsWith(inputString.toLocaleLowerCase()))
    } else {
      this._items = this.items
    }
  }

  override onblur = ($event: FocusEvent) => {
    if (this.active) {
      $event.preventDefault()
      $event.stopPropagation()
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutOfComponent(targetElement: HTMLElement): void {
    if (this.active) {
      if (!this.elementRef.nativeElement.contains(targetElement)) {
        this.active = false
        this.elementRef.nativeElement.blur()
      }
    }
  }

}