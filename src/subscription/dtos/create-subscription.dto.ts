import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';

export class CreateSubscriptionDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  city: string;

  @IsEnum(SubscriptionFrequencyEnum)
  frequency: SubscriptionFrequencyEnum;
}
