import {
  Controller,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { WeatherService } from '../application/weather.service';
import { HTTP_ERROR_MESSAGES } from '../../common/constants/http.constants';
import { HttpError } from 'src/common/interfaces/http-error.interface';
import { Weather } from '../domain/weather.model';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query('city') city: string): Promise<Weather> {
    if (!city) {
      throw new BadRequestException(
        HTTP_ERROR_MESSAGES.WEATHER_INVALID_REQUEST,
      );
    }

    try {
      const weather = await this.weatherService.getCurrentWeather(city);
      return weather;
    } catch (err: unknown) {
      console.log(err);
      const error = err as HttpError;

      if (error.response?.status === HttpStatus.BAD_REQUEST) {
        throw new NotFoundException(HTTP_ERROR_MESSAGES.WEATHER_CITY_NOT_FOUND);
      }

      throw new BadRequestException(
        HTTP_ERROR_MESSAGES.WEATHER_INVALID_REQUEST,
      );
    }
  }
}
