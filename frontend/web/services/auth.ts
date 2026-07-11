import { api } from "@/lib/api";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "@/types/auth";
import { User } from "@/types/user";

interface AuthState {
  token: string | null;
  user: User | null;

  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export async function register(body: RegisterRequest) {
  const { data } = await api.post("/auth/register", body);
  return data;
}

export async function login(
  body: LoginRequest
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(
    "/auth/login",
    body
  );

  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}
