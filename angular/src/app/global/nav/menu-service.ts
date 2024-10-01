import { Injectable } from "@angular/core";
import { MenuButtonItem, NavService } from "./nav.service";
import { profile } from "../../profile/profile.state";
import { AppState } from "../../app.state";
import { Store } from "@ngrx/store";
import { Location } from '@angular/common';
import { Profile } from "../../profile/profile.model";
import { combineLatest, filter, map, Observable, shareReplay, startWith } from "rxjs";
import { HomepageComponent } from "../view/homepage/homepage.component";
import { ResolveEnd, Router } from "@angular/router";
import { Path } from "./path";
import { Theme } from "../theme/theme";
import { UnityTheme } from "../theme/unity.theme";
import { DefaultTheme } from "../theme/default.theme";


@Injectable({
    providedIn: 'root'
})
export class MenuService {

    constructor(
        private readonly store: Store<AppState>,
        private readonly router: Router,
        private readonly nav: NavService,
        private readonly location: Location,
    ) {
    }

    public menuBtns$: Observable<MenuButtonItem[]> = combineLatest([
        this.router.events.pipe(
            filter(event => event instanceof ResolveEnd),
            map(event => event.url),
            startWith(this.location.path()),
            map(url => url.replace('/', ''))
        ),
        this.store.select(profile)
    ]).pipe(
        map(([path, profile]) => this.allButtons
            .filter(btn => btn.path !== path)
            .filter(btn => btn.filter ? btn.filter(profile) : true)
        ),
        shareReplay()
    )

    public menuReversed$ = this.menuBtns$.pipe(
        map(btns => btns.slice().reverse())
    )

    public btnClick(btn: MenuButtonItem) {
        if (btn.onclick) {
          btn.onclick()
        }
        if (typeof btn.path === 'string') {
          this.nav.to(btn.path)
        }
    }

    private readonly homeButton: MenuButtonItem  = {
        label: 'Home',
        path: HomepageComponent.path,
    }
    private readonly panelButton: MenuButtonItem  = {
        label: 'Panel',
        path: Path.PANEL,
        filter: (profile?: Profile) => !!profile, 
    }
    private readonly bookNowButton: MenuButtonItem  = {
        label: 'Book now',
        path: Path.BOOK_FORM_VIEW,
    }
    private readonly artistsButton: MenuButtonItem  = {
        label: 'Artists',
        path: Path.ARTISTS_LIST_VIEW
    }
    private readonly loginButton: MenuButtonItem  = {
        label: 'Login',
        path: Path.LOGIN,
        filter: (profile?: Profile) => !profile, 
    }

    private flag = true

    private readonly testThemeButton: MenuButtonItem  = {
        label: 'Test',
        onclick: () => {

            if (this.flag) {
                this.flag = false
                Theme.setTheme(DefaultTheme)
            } else {
                this.flag = true
                Theme.setTheme(UnityTheme)
            }
        }
    }


    private allButtons: MenuButtonItem[] = [
        this.homeButton,
        this.artistsButton,
        this.bookNowButton,
        this.panelButton,
        this.loginButton,
        this.testThemeButton
    ]

}
