import { Component, ElementRef, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArtistService } from '../../../artist/artist.service';
import { Observable, shareReplay, take, tap, withLatestFrom } from 'rxjs';
import { ArtistViewDto } from '../../../artist/model/artist-view.dto';
import { CommonModule } from '@angular/common';
import { BookFormComponent } from '../../../booking/view/book-form/book-form.component';
import { BtnComponent } from '../../../global/controls/btn/btn.component';
import { ButtonComponent } from '../../../global/controls/button/button.component';
import { FileViewComponent } from '../../../global/controls/file-loader/file-view/file-view.component';
import { CountryComponent } from '../../../global/components/country/country.component';
import { HeaderComponent } from '../../../global/components/header/header.component';
import { MediaItemComponent } from '../../../global/components/media-item/media-item.component';
import { MenuButtonComponent } from '../../../global/components/menu-button/menu-button.component';
import { NavService } from '../../../global/nav/nav.service';
import { DESKTOP } from '../../../global/services/device';
import { TextareaElementComponent } from '../../../global/controls/textarea-element/textarea-element.component';
import { NotFoundPageComponent } from '../../../global/view/error/not-found-page/not-found-page.component';
import { AppState } from '../../../app.state';
import { Store } from '@ngrx/store';
import { profileChange } from '../../../profile/profile.state';
import { IconButtonComponent } from "../../../global/components/icon-button/icon-button.component";

@Component({
  selector: 'app-artist-view',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeaderComponent,
    MenuButtonComponent,
    FileViewComponent,
    CountryComponent,
    TextareaElementComponent,
    MediaItemComponent,
    ButtonComponent,
    BtnComponent,
    IconButtonComponent
],
  templateUrl: './artist-view.component.html',
  styleUrl: './artist-view.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ArtistViewComponent {

  DESKTOP = DESKTOP

  public static readonly path = `artist/:name`

  artistName?: string
  _artist$?: Observable<ArtistViewDto>

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService,
    private nav: NavService,
    private store: Store<AppState>,
  ) {}


  _isViewOwner = false


  ngOnInit() {
    this.artistName = this.route.snapshot.paramMap.get('name') || ''
    if (!this.artistName) {
      this.nav.to(NotFoundPageComponent.path)
    } else {
      this.fetchArtist()
    }
  }

  private fetchArtist() {
    this._artist$ = this.artistService.fetchArtist$(this.artistName!).pipe(
      take(1),
      shareReplay(),
      tap(artist => this.isViewOwner(artist))
    )
  }

  private isViewOwner(artist: ArtistViewDto) {
    this.store.select(profileChange).pipe(
      take(1),
    ).subscribe(profile => {
      this._isViewOwner = profile?.artistSignature === artist.signature
      console.log('this._isViewOwner')
      console.log(this._isViewOwner)
    })
  }

  _onBookNow() {
    this.nav.to(BookFormComponent.path)
  }

  _editMode = false

  _editToggle() {
    this._editMode = !this._editMode
  }

}
