import { Component, ViewEncapsulation } from '@angular/core';
import { LogoComponent } from '../../components/logo/logo.component';
import { HomepageFormComponent } from './homepage-form/homepage-form.component';
import { ArtistsSectionComponent } from './artists-section/artists-section.component';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuButtonComponent } from '../../components/menu-button/menu-button.component';
import { DESKTOP } from '../../services/device';
import { FeedbackComponent } from './feedback/feedback.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    LogoComponent,
    HomepageFormComponent,
    MenuButtonComponent,
    HeaderComponent,
    ArtistsSectionComponent,
    FeedbackComponent,
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HomepageComponent {

  public static readonly path = ''

  DESKTOP = DESKTOP

}
  