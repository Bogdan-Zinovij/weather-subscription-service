export interface WeatherApiResponse {
  location: {
    name: string;
  };
  current: {
    temp_c: number;
    humidity: number;
    condition: {
      text: string;
    };
  };
}
