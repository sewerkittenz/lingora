import { apiRequest } from "./queryClient";
import type { User } from "@shared/schema";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  const data = await response.json();
  return data.user;
}

export async function register(userData: RegisterData): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/register", userData);
  const data = await response.json();
  return data.user;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiRequest("POST", "/api/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiRequest("POST", "/api/auth/reset-password", { token, password });
}
