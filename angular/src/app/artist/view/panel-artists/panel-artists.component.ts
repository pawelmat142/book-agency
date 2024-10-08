import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ArtistService } from '../../artist.service';
import { AppState } from '../../../app.state';
import { Store } from '@ngrx/store';
import { noop, Observable, Observer, of, tap } from 'rxjs';
import { ArtistStatus, ArtistViewDto } from '../../model/artist-view.dto';
import { StatusPipe } from "../../../global/pipes/status.pipe";
import { BtnComponent } from '../../../global/controls/btn/btn.component';
import { NavService } from '../../../global/nav/nav.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaComponent } from '../../../global/controls/textarea/textarea.component';
import { FormUtil } from '../../../global/utils/form.util';
import { CourtineService } from '../../../global/nav/courtine.service';
import { DialogService } from '../../../global/nav/dialog.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-panel-artists',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextareaComponent,
    StatusPipe,
    MatTooltipModule,
    BtnComponent,
    AccordionModule,
],
  templateUrl: './panel-artists.component.html',
  styleUrl: './panel-artists.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PanelArtistsComponent {

  constructor(
    private readonly artistService: ArtistService,
    private readonly courtineService: CourtineService,
    private readonly dialog: DialogService,
    private readonly nav: NavService,
    private readonly store: Store<AppState>,
  ) {}

  _artists$: Observable<ArtistViewDto[]> = of([])

  ngOnInit(): void {
    this.courtineService.startCourtine()
    this.fetchArtistsOfManager()
  }


  _artistView(artist: ArtistViewDto) {
    this.nav.toArtist(artist.name)
  }

  _selectedArtist?: ArtistViewDto

  _select(artist?: ArtistViewDto) {
    this._selectedArtist = artist
  }

  _cancelManagementNotesEdit() {
    this._selectedArtist = undefined
    this.managementNotesForm = undefined
  }

  managementNotesForm?: FormGroup

  _addNotes(artist: ArtistViewDto) {
    this._select(artist)
    this.managementNotesForm = this._selectedArtist
    ? new FormGroup({
      managmentNotes: new FormControl(this._selectedArtist.managmentNotes, Validators.required)
    }) : undefined
  }

  _submitManagementNotes() {
    if (!this.managementNotesForm || this.managementNotesForm.invalid) {
      FormUtil.markForm(this.managementNotesForm!)
      return
    }
    this.courtineService.startCourtine()
    this.artistService.putManagementNotes$({
      managmentNotes: this.managementNotesForm.controls['managmentNotes'].value || '',
      artistSignture: this._selectedArtist?.signature || ''
    }).pipe(
    ).subscribe(this.updateArtistObserver())
  }

  _artistStatusTooltip(status: ArtistStatus): string {
    if (status === 'CREATED') {
      return `When artist finishes editing his view, you will be able to make it public`
    }
    if (status === 'READY') {
      return `Artist view is ready, you can publish it`
    }
    return ''
  }

  _activate(artist: ArtistViewDto) {
    this.setArtistStatus(artist, 'ACTIVE')
  }
  
  _deactivate(artist: ArtistViewDto) {
    this.setArtistStatus(artist, 'INACTIVE')
  }

  private setArtistStatus(artist: ArtistViewDto, status: ArtistStatus) {
    this.courtineService.startCourtine()
    this.artistService.setStatus$(status, artist.signature).pipe(
    ).subscribe(this.updateArtistObserver())
  }

  private updateArtistObserver(): Observer<void> {
    return {
      next: () => {
        this.fetchArtistsOfManager()
      }, 
      error: (error) => {
        this.dialog.errorPopup(error.error.message)
        this.courtineService.stopCourtine()
      },
      complete: noop
    }
  }

  private fetchArtistsOfManager() {
    this._artists$ = this.artistService.fetchArtistsOfManager$().pipe(
      tap(() => {
        this._cancelManagementNotesEdit()
        this.courtineService.stopCourtine()
      })
    )
  }

}
