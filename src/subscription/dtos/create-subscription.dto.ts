import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  city: string;

  @IsEnum(['hourly', 'daily'])
  frequency: 'hourly' | 'daily';
}
