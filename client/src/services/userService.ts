import { API_PATHS, apiRequest } from './apiClient';
import type {
  LoginRequest,
  OtpRequest,
  ParentOtpRequest,
  ProcessOtpRequest,
} from '../types/api';
import type { LoginResponse, User } from '../types/entities';

export const userService = {
  login(data: LoginRequest) {
    return apiRequest<LoginResponse>(`${API_PATHS.USER}/login`, {
      method: 'POST',
      auth: false,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  register(formData: FormData) {
    return apiRequest<User>(API_PATHS.USER, {
      method: 'POST',
      auth: false,
      body: formData,
    });
  },

  getById(id: string) {
    return apiRequest<User & { profileUrl?: string }>(`${API_PATHS.USER}/${id}`);
  },

  update(id: string, formData: FormData) {
    return apiRequest<User>(`${API_PATHS.USER}/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  generateOtp(data: OtpRequest) {
    return apiRequest<unknown>(`${API_PATHS.USER}/generateotp`, {
      method: 'POST',
      auth: false,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  processOtp(data: ProcessOtpRequest) {
    return apiRequest<unknown>(`${API_PATHS.USER}/processotp`, {
      method: 'POST',
      auth: false,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  parentGenerateOtp(data: ParentOtpRequest) {
    return apiRequest<unknown>(`${API_PATHS.USER}/parentgenerateotp`, {
      method: 'POST',
      auth: false,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  parentProcessOtp(data: ParentOtpRequest) {
    return apiRequest<string>(`${API_PATHS.USER}/parentproccessotp`, {
      method: 'POST',
      auth: false,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  parentHome() {
    return apiRequest<null, User>(`${API_PATHS.USER}/parenthome`, {
      method: 'GET',
      auth: false,
      credentials: 'include',
    });
  },
};
