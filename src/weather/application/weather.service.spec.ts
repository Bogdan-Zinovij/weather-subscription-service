import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpService } from '@nestjs/axios';
import { AppConfigService } from 'src/config/app-config.service';
import { of } from 'rxjs';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { Weather } from '../domain/weather.model';

describe('WeatherService', () => {
  let service: WeatherService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let httpService: HttpService;

  const mockAppConfigService = {
    getWeatherApiConfig: () => ({
      baseUrl: 'http://weather-api.com',
      apiKey: 'test-api-key',
    }),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should return current weather for a city', async () => {
    const city = 'Kyiv';
    const mockResponse: AxiosResponse = {
      data: {
        location: { name: 'Kyiv' },
        current: {
          temp_c: 20,
          humidity: 60,
          condition: { text: 'Sunny' },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new AxiosHeaders(),
      },
    };

    mockHttpService.get.mockReturnValue(of(mockResponse));

    const result = await service.getCurrentWeather(city);
    expect(result).toEqual(new Weather(20, 60, 'Sunny'));
    expect(mockHttpService.get).toHaveBeenCalledWith(
      'http://weather-api.com?key=test-api-key&q=Kyiv&aqi=no',
    );
  });
});
