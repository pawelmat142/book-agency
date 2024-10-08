import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { CountryComponent } from '../../../../global/components/country/country.component';
import { artistCountry, artistName, editMode, updateCountry, updateName } from '../artist-view.state';
import { FormsModule } from '@angular/forms';
import { SelectorItemsComponent } from '../../../../global/controls/selector/selector-items/selector-items.component';
import { SelectorItem } from '../../../../global/controls/selector/selector.component';
import { CountriesService } from '../../../../global/countries/countries.service';
import { tap } from 'rxjs';
import { StyleComponent } from '../style/style.component';
import { DESKTOP } from '../../../../global/services/device';
import { ArtistService } from '../../../artist.service';

@Component({
  selector: 'app-name',
  standalone: true,
  imports: [
    CommonModule,
    CountryComponent,
    FormsModule,
    SelectorItemsComponent,
    StyleComponent,
  ],
  templateUrl: './name.component.html',
  styleUrl: './name.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class NameComponent {

  readonly DESKTOP = DESKTOP

  constructor(
    private readonly countriesService: CountriesService,
    private readonly artistService: ArtistService,
    private readonly store: Store<AppState>,
  ) {}

  @ViewChild('nameInput') nameInput?: ElementRef

  _countryItems: SelectorItem[] = []

  ngOnInit(): void {
    this._countryItems = this.countriesService.getCountries()
  }

  _editable$ = this.artistService.artistViewEditable$

  _editMode = false
  
  _editMode$ = this.store.select(editMode).pipe(
    tap(mdoe => {
      this._editMode = mdoe
      if (!mdoe) {
        this._editName = false
        this._editCountry = false
      }
    })
  )

  _editName = false

  _name$ = this.store.select(artistName).pipe(
  )

  _country$ = this.store.select(artistCountry).pipe(
  )


  editName() {
    this._editName = !this._editName
    if (this._editName) {
      setTimeout(() => {
        this.nameInput?.nativeElement.focus()
      }, 100)
    }
  }

  _editCountry = false

  editCountry() {
    this._editCountry = true
  }

  _selectCountry(item: SelectorItem) {
    this.store.dispatch(updateCountry({ value: item }))
    this._editCountry = false
  }

  _nameChange($event: Event) {
    const target = $event.target as HTMLInputElement
    this.store.dispatch(updateName({ value: target.value }))
  }

}
