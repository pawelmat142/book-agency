import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

import { routes } from './app.routes';

import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { provideState, provideStore } from '@ngrx/store';
import { ArtistEffect, artistsReducer } from './artist/artists.state';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { FormEffect, formReducer } from './form-processor/form.state';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { ProfileEffect, profileReducer } from './profile/profile.state';
import { initCountries, CountriesService } from './global/countries/countries.service';
import { AuthInterceptor } from './profile/auth.interceptor';
import { ArtistViewEffect, artistViewReducer } from './artist/view/artist-view/artist-view.state';

registerLocaleData(localeEn);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideStore(),
    provideState({ name: 'artistsState', reducer: artistsReducer }),
    provideState({ name: 'formState', reducer: formReducer }),
    provideState({ name: 'profileState', reducer: profileReducer }),
    provideState({ name: 'artistViewState', reducer: artistViewReducer }),
    provideEffects([ArtistEffect, FormEffect, ProfileEffect, ArtistViewEffect]),
    
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideAnimationsAsync(),

    provideStorage(() => getStorage()),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),

    { 
        provide: FIREBASE_OPTIONS, 
        useValue: environment.firebaseConfig 
    },
    {
        provide: LOCALE_ID,
        useValue: 'en-EN'
    },
    {
        provide: APP_INITIALIZER,
        useFactory: initCountries,
        deps: [CountriesService],
        multi: true
    },
    { 
        provide: HTTP_INTERCEPTORS, 
        useClass: AuthInterceptor, 
        multi: true 
    },


    provideStoreDevtools({ maxAge: 25, logOnly: environment.production,  }),

    ]
}

