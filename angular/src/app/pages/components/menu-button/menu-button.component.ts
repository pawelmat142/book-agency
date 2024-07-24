import { Component, ElementRef, HostBinding, HostListener, ViewChild } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MenuButtonItem, NavService } from '../../../services/nav.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-menu-button',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './menu-button.component.html',
  styleUrl: './menu-button.component.scss'
})
export class MenuButtonComponent {

  constructor(
    private readonly nav: NavService
  ) {}


  @HostBinding('class.menu-button-open') menuButtonOpen = false

  @ViewChild('menuButtonRef') menuButtonRef?: ElementRef

  private menuButtonOverhiddenBefore = false
  
  @HostListener('window:scroll', ['$event'])
  isMenuButtonOverhidden() {
    const rect = this.menuButtonRef?.nativeElement.getBoundingClientRect()
    const menuButtonOverhidden = rect.bottom < 0
    if (this.menuButtonOverhiddenBefore !== menuButtonOverhidden) {
      this.nav.menuButtonOverhidden = menuButtonOverhidden
      this.menuButtonOverhiddenBefore = menuButtonOverhidden
    }
  }

  buttons: MenuButtonItem[] = []

  ngOnInit() {
    this.buttons = this.nav.menuButtons
  }

  toggleButton() {
    this.menuButtonOpen = !this.menuButtonOpen
  }
}
