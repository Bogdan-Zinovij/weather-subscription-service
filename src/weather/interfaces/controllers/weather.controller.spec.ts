import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from 'src/weather/application/weather.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Weather } from 'src/weather/domain/weather.model';
import { HTTP_ERROR_MESSAGES } from 'src/common/constants/http.constants';

describe('WeatherController', () => {
  let controller: WeatherController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let weatherService: WeatherService;

  const mockWeatherService = {
    getCurrentWeather: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [{ provide: WeatherService, useValue: mockWeatherService }],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw BadRequestException if city is missing', async () => {
    await expect(controller.getWeather('')).rejects.toThrow(
      new BadRequestException(HTTP_ERROR_MESSAGES.WEATHER_INVALID_REQUEST),
    );
  });

  it('should return weather data for a city', async () => {
    const city = 'Lviv';
    const weather = new Weather(15, 50, 'Cloudy');

    mockWeatherService.getCurrentWeather.mockResolvedValue(weather);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await controller.getWeather(city);
    expect(result).toEqual(weather);
    expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledWith(city);
  });

  it('should throw NotFoundException if API returns 400', async () => {
    const error = {
      response: { status: 400 },
    };

    mockWeatherService.getCurrentWeather.mockRejectedValue(error);

    await expect(controller.getWeather('Kharkiv')).rejects.toThrow(
      new NotFoundException(HTTP_ERROR_MESSAGES.WEATHER_CITY_NOT_FOUND),
    );
  });

  it('should throw BadRequestException for other errors', async () => {
    const error = {
      response: { status: 500 },
    };

    mockWeatherService.getCurrentWeather.mockRejectedValue(error);

    await expect(controller.getWeather('Odesa')).rejects.toThrow(
      new BadRequestException(HTTP_ERROR_MESSAGES.WEATHER_INVALID_REQUEST),
    );
  });
});
