/**
 * authApi.ts
 * Real API calls to the configured backend.
 * Endpoints: /User/Login, /User/InsertUser, /User/forgot-password
 */
import apiClient from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/auth";

type BackendLoginResponse = {
  message?: string;
  token?: string;
  role?: string;
  user_id?: string | number;
  uuid?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  user_type?: string;
};

type BackendRegisterResponse = {
  message?: string;
  user_id?: string | number;
  uuid?: string;
  email?: string;
  first_name?: string;
};

type BackendValidateTokenResponse = {
  success?: boolean;
  message?: string;
  user?: {
    uuid?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    user_type?: string;
    is_verified?: boolean;
  };
};

const extractToken = (payload: BackendLoginResponse): string => {
  const token = payload.token;
  if (!token) {
    throw new Error("Login response did not include a token.");
  }
  return token;
};

const normalizeRole = (roleValue?: string): LoginResponse["role"] => {
  if (roleValue === "admin" || roleValue === "vendor" || roleValue === "user") {
    return roleValue;
  }
  return "user";
};

type BackendForgotPasswordResponse = {
  success: boolean;
  message: string;
};

const toNameFromEmail = (email: string): string => {
  const prefix = email.split('@')[0] ?? 'Guest';
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
};

// ─── Server Warm-up ──────────────────────────────────────────
// Render free tier sleeps after inactivity. Fire this on app launch so the
// server wakes up before the user hits a real endpoint (login / register).

export const warmupServer = async (): Promise<void> => {
	try {
		// GET / returns 200 "Welcome to the Event Management API" — confirmed in Server.js
		await apiClient.get('/', { timeout: 10000 });
	} catch {
		// Any response means the server is awake — ignore errors.
	}
};

// ─── Login ───────────────────────────────────────────────────

export const login = async (input: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<BackendLoginResponse>(
    API_ENDPOINTS.auth.login,
    {
      email: input.email,
      password: input.password,
    },
  );

  const payload = response.data;
  const firstName = payload.first_name || toNameFromEmail(input.email);
  const lastName = payload.last_name || '';
  const fullName = lastName ? `${firstName} ${lastName}`.trim() : firstName;

  return {
    token: extractToken(payload),
    role: normalizeRole(payload.user_type ?? payload.role),
    name: fullName,
    email: input.email,
    userId: payload.user_id,
    uuid: payload.uuid,
    message: payload.message,
  };
};

// ─── Register ────────────────────────────────────────────────

const isEmailAlreadyExists = (err: unknown): boolean => {
  const msg = String(
    (err as Record<string, unknown>)?.message ?? "",
  ).toLowerCase();
  return msg.includes("email already exists") || msg.includes("already exists") || msg.includes("already registered");
};

const isNetworkOrConnectionError = (err: unknown): boolean => {
  const e = err as Record<string, unknown>;
  return Boolean(e?.isNetworkError);
};

export const register = async (
  input: RegisterRequest,
): Promise<RegisterResponse> => {
  const body = {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    password: input.password,
    user_type: input.userType ?? "user",
  };

  const makeRequest = async (): Promise<RegisterResponse> => {
    const response = await apiClient.post<BackendRegisterResponse>(
      API_ENDPOINTS.auth.register,
      body,
    );
    return {
      success: response.status >= 200 && response.status < 300,
      message: response.data.message ?? "Registration successful. Please login.",
      userId: response.data.user_id,
      uuid: response.data.uuid,
      requiresVerification: true,
    };
  };

  try {
    return await makeRequest();
  } catch (firstError) {
    // Only retry when the connection was lost — the server may have already
    // created the user but the response never made it back to the app.
    if (!isNetworkOrConnectionError(firstError)) throw firstError;

    // Give the server time to fully wake up (Render cold-start recovery).
    await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      return await makeRequest();
    } catch (retryError) {
      // If the backend says the email already exists the first request
      // succeeded — the user IS registered, just return success.
      if (isEmailAlreadyExists(retryError)) {
        return {
          success: true,
          message: "Registration successful. Please check your email to verify your account.",
          requiresVerification: true,
        };
      }
      throw retryError;
    }
  }
};

// ─── Forgot Password ─────────────────────────────────────────

export const forgotPassword = async (email: string): Promise<string> => {
  const response = await apiClient.post<{ message?: string }>(
    API_ENDPOINTS.auth.forgotPassword,
    {
      email,
    },
  );
  return (
    response.data.message ??
    "Reset instructions have been sent if the account exists."
  );
};

export const resendVerificationEmail = async (
  email: string,
): Promise<string> => {
  const response = await apiClient.post<{ message?: string }>(
    API_ENDPOINTS.auth.resendVerification,
    {
      email,
    },
  );

  return (
    response.data.message ?? "Verification email sent. Please check your inbox."
  );
};

export type AuthenticatedUserProfile = {
  uuid: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: LoginResponse["role"];
  isVerified: boolean;
};

export const validateToken = async (): Promise<AuthenticatedUserProfile> => {
  const response = await apiClient.post<BackendValidateTokenResponse>(
    API_ENDPOINTS.auth.validateToken,
  );
  const user = response.data.user;

  if (!user?.email) {
    throw new Error(response.data.message ?? "Unable to fetch user profile.");
  }

  return {
    uuid: user.uuid ?? null,
    email: user.email,
    firstName: user.first_name ?? toNameFromEmail(user.email),
    lastName: user.last_name ?? "",
    role: normalizeRole(user.user_type),
    isVerified: Boolean(user.is_verified),
  };
};

export const changePassword = async (payload: {
  email: string;
  oldPassword: string;
  newPassword: string;
}): Promise<string> => {
  const response = await apiClient.post<{ message?: string }>(
    API_ENDPOINTS.auth.changePassword,
    {
      email: payload.email,
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
    },
  );

  return response.data.message ?? "Password changed successfully.";
};
