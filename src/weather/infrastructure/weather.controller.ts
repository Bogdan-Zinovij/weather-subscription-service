import {
  Controller,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { WeatherService } from '../application/weather.service';
import { Weather } from '../domain/weather.model';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query('city') city: string): Promise<Weather> {
    if (!city) {
      throw new BadRequestException('City parameter is required');
    }

    interface HttpError {
      response?: {
        status?: number;
      };
    }

    try {
      return await this.weatherService.getCurrentWeather(city);
    } catch (err: unknown) {
      const error = err as HttpError;

      if (error.response?.status === 404) {
        throw new NotFoundException('City not found');
      }

      throw new BadRequestException('Invalid request');
    }
  }
}
