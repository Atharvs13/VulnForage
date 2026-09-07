export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string; requestId?: string };
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
}
