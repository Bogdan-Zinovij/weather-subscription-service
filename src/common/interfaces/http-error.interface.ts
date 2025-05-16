export interface HttpError {
  response?: {
    status?: number;
    data?: any;
  };
}
