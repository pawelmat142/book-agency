import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CountriesService } from '../../../services/countries/countries.service';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { Country } from '../../../services/countries/country.model';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [CommonModule, IconButtonComponent],
  templateUrl: './country.component.html',
  styleUrl: './country.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CountryComponent {

  constructor(
    private readonly countriesService: CountriesService
  ) {}

  @Input() countryCode!: string
  @Input() size = 20

  _country?: Country

  ngOnInit(): void {
    this._country = this.countriesService.findByCode(this.countryCode)
    if (!this._country) {
      console.error('Country not found')
    }
  }

}
