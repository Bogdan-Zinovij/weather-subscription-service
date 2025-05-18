import { Injectable } from '@nestjs/common';
import { Weather } from '../domain/weather.model';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { WeatherApiResponse } from '../../common/interfaces/weatherapi-response.interface';

@Injectable()
export class WeatherService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const baseUrl = this.configService.get<string>('WEATHER_API_BASE_URL');
    if (!baseUrl) {
      throw new Error('WEATHER_API_BASE_URL is not defined in configuration');
    }
    this.baseUrl = baseUrl;
  }

  async getCurrentWeather(city: string): Promise<Weather> {
    const apiKey = this.configService.get<string>('WEATHER_API_KEY');
    const url = `${this.baseUrl}?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`;

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
