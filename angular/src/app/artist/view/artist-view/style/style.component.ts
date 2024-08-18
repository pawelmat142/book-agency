import { Component, ViewEncapsulation } from '@angular/core';
import { AppState } from '../../../../app.state';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { editMode, profileIsOwner, updateLabels, updateStyle } from '../artist-view.state';
import { TextareaElementComponent } from '../../../../global/controls/textarea-element/textarea-element.component';
import { filter, map, take, tap, withLatestFrom } from 'rxjs';
import { ArtistService } from '../../../artist.service';
import { DialogService } from '../../../../global/nav/dialog.service';
import { DialogData } from '../../../../global/nav/dialogs/popup/popup.component';
import { ArtistLabel, ArtistStyle } from '../../../model/artist-view.dto';
import { Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-style',
  standalone: true,
  imports: [
    CommonModule,
    TextareaElementComponent,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './style.component.html',
  styleUrl: './style.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class StyleComponent {
  
  constructor(
    private readonly store: Store<AppState>,
    private readonly dialog: DialogService,
    private readonly artistService: ArtistService,
  ) {}

  _styles$ = this.store.select(state => state.artistViewState.artist?.styles).pipe(
    tap(styles => this._canRemoveStyle = (styles || [])?.length > 1)
  )

  _labels$ = this.store.select(state => state.artistViewState.artist?.labels).pipe(
    tap(labels => this._labels = labels || [])
  )

  _canRemoveStyle = false
  _labels: ArtistLabel[] = []

  _editMode$ = this.store.select(editMode).pipe(
    tap(editMode => this._editMode = editMode)
  )

  _profileIsOwner$ = this.store.select(profileIsOwner).pipe(
  )

  _editMode = false

  _addStyle() {
    this.artistService.listMusicStyles$().pipe(
      take(1),
      withLatestFrom(this._styles$),
      tap(([allStyles, _artistStyles]) => {
        let artistStyles = _artistStyles || []
        const stylesToSelect = allStyles.filter(s => !artistStyles?.map(as => as.id).includes(s.id))
        const data: DialogData = {
          header: stylesToSelect.length 
          ? 'Select music style or add new'
          : 'Add music style',
          chips: stylesToSelect,
          input: 'style',
          inputValidators: [Validators.required]
        }
        this.dialog.popup(data).afterClosed() .pipe(
          filter(name => !!name && typeof name === 'string'),
          map((styleName) => {
            let artistStyles = _artistStyles || []
            const foundStyle = allStyles.find(s => s.name === styleName)
            if (foundStyle) {
              return [...artistStyles, foundStyle]
            } else {
              const newStyle = {
                name: styleName as string,
                // order: Math.max(...(artistStyles?.map(s => s.order) || [])) + 1,
                id: `${Date.now()}`,
              }
              return [...artistStyles, newStyle]
            }
          }),
          tap(styles => this.store.dispatch(updateStyle({ value: styles })))
        ).subscribe()
      })
    ).subscribe()
  }

  _removeStyle(style: ArtistStyle) {
    this._styles$.pipe(
      take(1),
      tap(styles => {
        const newStyles = styles?.filter(s => s.id !== style.id) || []
        this.store.dispatch(updateStyle({ value: newStyles }))
      })
    ).subscribe()
  }

  _addLabel() {
    this.artistService.listArtistLabels$().pipe(
      take(1),
      withLatestFrom(this._labels$),
      tap(([allLabels, _artistLabels]) => {
        let artistLabels = _artistLabels || []
        const labelsToSelect = allLabels.filter(l => !artistLabels.map(al => al.id).includes(l.id))
        labelsToSelect.forEach(l => l.class = 'red-chip')
        const data: DialogData = {
          header: labelsToSelect.length 
          ? 'Select label or add new'
          : 'Add label',
          chips: labelsToSelect,
          input: 'label',
          inputValidators: [Validators.required]
        }
        this.dialog.popup(data).afterClosed() .pipe(
          filter(name => !!name && typeof name === 'string'),
          map((labelName) => {
            const foundLabel = allLabels.find(s => s.name === labelName)
            if (foundLabel) {
              return [...artistLabels, foundLabel]
            } else {
              const newLabel = {
                name: labelName as string,
                id: `${Date.now()}`,
              }
              return [...artistLabels, newLabel]
            }
          }),
          tap(labels => this.store.dispatch(updateLabels({ value: labels })))
        ).subscribe()
      })
    ).subscribe()
  }

  _removeLabel(label: ArtistLabel) {
    this._labels$.pipe(
      take(1),
      tap(labels => {
        const newLabels = labels?.filter(l => l.id !== label.id) || []
        this.store.dispatch(updateLabels({ value: newLabels }))
      })
    ).subscribe()
  }

}
