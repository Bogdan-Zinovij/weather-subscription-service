export class Subscription {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly city: string,
    public readonly frequency: 'hourly' | 'daily',
    public confirmed: boolean,
  ) {}
}
