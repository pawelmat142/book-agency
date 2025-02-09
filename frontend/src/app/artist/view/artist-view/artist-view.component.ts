import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArtistService } from '../../../artist/artist.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../global/components/header/header.component';
import { MenuButtonComponent } from '../../../global/components/menu-button/menu-button.component';
import { NavService } from '../../../global/nav/nav.service';
import { NotFoundPageComponent } from '../../../global/view/error/not-found-page/not-found-page.component';
import { AppState } from '../../../app.state';
import { Store } from '@ngrx/store';
import { IconButtonComponent } from "../../../global/components/icon-button/icon-button.component";
import { AvatarComponent } from './avatar/avatar.component';
import { artist, cancelArtistChanges, editMode, initArtist, saveChanges, startEditArtist, updateTimeline } from './artist-view.state';
import { BackgroundComponent } from './background/background.component';
import { BackgroundEditorComponent } from './background-editor/background-editor.component';
import { BioComponent } from './bio/bio.component';
import { NameComponent } from './name/name.component';
import { MediasComponent } from './medias/medias.component';
import { StyleComponent } from './style/style.component';
import { TextareaElementComponent } from '../../../global/controls/textarea-element/textarea-element.component';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ArtistUtil } from '../../artist.util';
import { ArtistViewDto } from '../../model/artist-view.dto';
import { BookingService } from '../../../booking/services/booking.service';
import { setFormData } from '../../../form-processor/form.state';
import { Path } from '../../../global/nav/path';
import { BehaviorSubject, mergeMap, take, tap } from 'rxjs';
import { ArtistTimelineService, TimelineItem } from '../../../booking/services/artist-timeline.service';
import { TimelineComponent } from '../../../global/components/timeline/timeline.component';
import { $desktop } from '../../../global/tools/media-query';
import { TimelineUtil } from '../../../global/utils/timeline.util';
import { Dialog } from '../../../global/nav/dialog.service';

@Component({
  selector: 'app-artist-view',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeaderComponent,
    MenuButtonComponent,
    IconButtonComponent,
    AvatarComponent,
    BackgroundComponent,
    BackgroundEditorComponent,
    BioComponent,
    NameComponent,
    MediasComponent,
    StyleComponent,
    TextareaElementComponent,
    TooltipModule,
    ButtonModule,
    TimelineComponent
  ],
  templateUrl: './artist-view.component.html',
  styleUrl: './artist-view.component.scss',
})
export class ArtistViewComponent {

  public static readonly path = `artist/:name`

  readonly $desktop = $desktop

  artistName?: string

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService,
    private bookingService: BookingService,
    private nav: NavService,
    private dialog: Dialog,
    private store: Store<AppState>,
    private readonly artistTimelineService: ArtistTimelineService,
  ) {}


  _editable$ = this.artistService.artistViewEditable$

  _editMode$ = this.store.select(editMode)

  _artist$ = this.store.select(artist)
    .pipe(tap(artist => this.loadTimeline(artist)))

  _timeline$ = new BehaviorSubject<TimelineItem[]>([])

  _disabledDays: Date[] = []

  ngOnInit() {
    this.artistName = this.route.snapshot.paramMap.get('name') || ''
    if (!this.artistName) {
      this.nav.to(NotFoundPageComponent.path)
    } else {
      this.store.dispatch(initArtist({ name: this.artistName }))
    }
  }

  private loadTimeline(artist?: ArtistViewDto): void {
    const signature = artist?.signature
    if (!signature) {
      this._timeline$.next([])
      return
    }
    this.artistTimelineService.artistTimeline$(signature)
      .subscribe(timeline => {
        this._disabledDays = TimelineUtil.getDisabledDates(timeline)
        this._timeline$.next(timeline)
      })
  }

  _onBookNow(artist: ArtistViewDto) {
    const artistControlValue = ArtistUtil.selectorItem(artist)
    const formData = {
      artistInformation: {
        artist: artistControlValue
      },
      promoterInformation: undefined
    }

    this.bookingService.findPromoterInfo$().subscribe(promoterInfo => {
      if (promoterInfo) {
        formData.promoterInformation = promoterInfo
      }
      this.nav.to(Path.BOOK_FORM_VIEW)
      setTimeout(() => {
        this.store.dispatch(setFormData(formData))
      })
    })
  }

  _viewAll() {
    this.nav.toArtists()
  }

  _editToggle() {
    this.store.dispatch(startEditArtist())
  }
  
  _discard() {
    this.store.dispatch(cancelArtistChanges())
  }
  
  _save() {
    this.store.dispatch(saveChanges())
  }

  _submitTimelineItem(artist: ArtistViewDto, event: TimelineItem) {
    this.artistService.submitTimelineEvent$(artist.signature, event).subscribe(timeline => {
      this._timeline$.next(timeline)
    })
  }

  _removeTimelineEvent(artist: ArtistViewDto, event: TimelineItem, timeline: TimelineItem[]) {
    this.dialog.yesOrNoPopup(`Remove timeline item, sure?`).pipe(
      mergeMap(() => this.artistService.removeTimelineEvent$(artist.signature, event.id)),
    ).subscribe(() => {
      const newTimeline = timeline.filter(t => t.id !== event.id)
      this._timeline$.next(newTimeline)
    })
  }

}
