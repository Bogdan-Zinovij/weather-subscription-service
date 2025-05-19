import { Injectable } from '@nestjs/common';
import { Weather } from '../domain/weather.model';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WeatherApiResponse } from '../../common/interfaces/weatherapi-response.interface';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class WeatherService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    appConfigService: AppConfigService,
  ) {
    const { baseUrl, apiKey } = appConfigService.getWeatherApiConfig();
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async getCurrentWeather(city: string): Promise<Weather> {
    const url = `${this.baseUrl}?key=${this.apiKey}&q=${encodeURIComponent(city)}&aqi=no`;

    const response: AxiosResponse<WeatherApiResponse> = await lastValueFrom(
      this.httpService.get<WeatherApiResponse>(url),
    );

    const data = response.data;

    return new Weather(
      data.current.temp_c,
      data.current.humidity,
      data.current.condition.text,
    );
  }
}
