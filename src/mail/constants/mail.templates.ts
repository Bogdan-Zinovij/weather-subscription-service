import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';

export const MailTemplates = {
  CONFIRM_SUBSCRIPTION: {
    subject: 'Confirm your subscription',
    html: (link: string, token: string) => `
    Your confirmation token: <b>${token}</b><br><br>
    Or just use this link to confirm your subscription:<br>
    <a href="${link}">confirmation link</a>
  `,
  },

  UNSUBSCRIBE_SUCCESS: {
    subject: 'Unsubscription',
    html: () => '<p>Subscription cancellation successfully completed</p>',
  },

  WEATHER_UPDATE: {
    subject: (city: string) => `Weather update for ${city}`,
    html: (
      city: string,
      weather: { temperature: number; humidity: number; description: string },
      unsubscribeLink: string,
    ) => `
      <p>Current weather in <strong>${city}</strong>:</p>
      <ul>
        <li>Temperature: ${weather.temperature}°C</li>
        <li>Humidity: ${weather.humidity}%</li>
        <li>Description: ${weather.description}</li>
      </ul>
      <p>If you no longer wish to receive updates, you can 
      <a href="${unsubscribeLink}">unsubscribe here</a>.</p>
    `,
  },

  SUBSCRIPTION_CONFIRMED: {
    subject: 'Subscription successfully confirmed',
    html: (
      frequency: SubscriptionFrequencyEnum,
      city: string,
      weather: { temperature: number; humidity: number; description: string },
      unsubscribeLink: string,
    ) => `<p>Now you will receive ${frequency} weather updates in the ${city} city.</p>
      <p>Current weather in <strong>${city}</strong>:</p>
      <ul>
        <li>Temperature: ${weather.temperature}°C</li>
        <li>Humidity: ${weather.humidity}%</li>
        <li>Description: ${weather.description}</li>
      </ul>
      <p>If you no longer wish to receive updates, you can 
      <a href="${unsubscribeLink}">unsubscribe here</a>.</p>
    `,
  },
};
