import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BtnComponent } from '../../../../global/controls/btn/btn.component';
import { SelectorComponent } from "../../../../global/controls/selector/selector.component";
import { loggedIn, login, logout } from '../../../profile.state';
import { Store } from '@ngrx/store';
import { Token } from '../token';
import { filter, noop, Observer, of, switchMap, tap } from 'rxjs';
import { FormUtil } from '../../../../global/utils/form.util';
import { LoginForm, ProfileService } from '../../../profile.service';
import { PanelComponent } from '../../../view/panel/panel.component';
import { HeaderComponent } from '../../../../global/components/header/header.component';
import { DialogService } from '../../../../global/nav/dialog.service';
import { NavService } from '../../../../global/nav/nav.service';
import { InputComponent } from '../../../../global/controls/input/input.component';
import { AppState } from '../../../../app.state';
import { RegisterComponent } from '../register/register.component';
import { DialogData } from '../../../../global/nav/dialogs/popup/popup.component';
import { CourtineService } from '../../../../global/nav/courtine.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    InputComponent,
    BtnComponent,
    SelectorComponent
],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  public static readonly path = 'login'

  constructor(
    private profileService: ProfileService,
    private dialog: DialogService,
    private nav: NavService,
    private courtine: CourtineService,
    private store: Store<AppState>,
  ) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.minLength(6), Validators.required]),
  })

  private loginToken?: string

  _nameOrEmailForm?: FormGroup

  _submit() {
    if (this._nameOrEmailForm) {
      if (this._nameOrEmailForm.valid) {
        this.loginRequest(this._nameOrEmailForm.controls['nameOrEmail'].value)
      } else {
        FormUtil.markForm(this._nameOrEmailForm)
        return
      }
    }

    if (!this.form.valid) {
      FormUtil.markForm(this.form)
      return
    }
    const form = this.form.value

    this.courtine.startCourtine()
    this.profileService.loginByEmail$(form as Partial<LoginForm>)
      .subscribe(this.loginResultObserver())
  }


  _byTelegram() {
    this.setNameOrEmailForm()
  }

  _register() {
    this.nav.to(RegisterComponent.path)
  }

  private setNameOrEmailForm() {
    this._nameOrEmailForm = new FormGroup({
      nameOrEmail: new FormControl('', Validators.required)
    })
  }

  private loginRequest(uidOrNameOrEmail: string) {
    this.courtine.startCourtine()
    this.profileService.telegramPinRequest$(uidOrNameOrEmail).pipe(
      switchMap(token => {
        if (!token?.token) {
          if (this._nameOrEmailForm) {
            this.dialog.simplePopup('Telegrm connection not found')
            this._nameOrEmailForm = undefined
          } else {
            this.setNameOrEmailForm()
          }
          return of(noop())
        }
        this.loginToken = token.token

        const data: DialogData = {
          header: '',
          input: 'pin',
          inputClass: 'max-300',
          inputValidators: [Validators.minLength(4), Validators.maxLength(4), Validators.pattern(/^[0-9]*$/)]
        }
        this.courtine.stopCourtine()
        return this.dialog.popup(data).afterClosed().pipe(
        )
      }),
      filter(pin => !!pin),
      switchMap(pin => this.profileService.loginByPin$({
        pin: pin,
        token: this.loginToken!
      })),
    ).subscribe(this.loginResultObserver())
  }

  private loginResultObserver(): Observer<{ token: string }> {
    return {
      next: (token: { token: string }) => {
        this.courtine.stopCourtine()
        this.store.dispatch(loggedIn(token))
        this.nav.to(PanelComponent.path)
        this.dialog.simplePopup('Logged in!')
      },
      error: (error: any) => {
        this.courtine.stopCourtine()
        this.dialog.errorPopup(error.error.message)
      },
      complete: () => noop()
    }
  }

}
