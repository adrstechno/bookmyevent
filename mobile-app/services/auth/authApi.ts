/**
 * authApi.ts
 * Real API calls to the backend at localhost:3232
 * Endpoints: /User/Login, /User/InsertUser, /User/forgot-password
 */
import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types/auth';

// ─── Backend response shapes ──────────────────────────────────

type BackendLoginResponse = {
	message: string;
	token: string;
	role: string;           // user_type from DB: 'user' | 'vendor' | 'admin'
	user_id: string;        // uuid
	email: string;
	first_name: string;
	last_name: string;
};

type BackendRegisterResponse = {
	message: string;
	userId?: number;
	requiresVerification?: boolean;
};

type BackendForgotPasswordResponse = {
	success: boolean;
	message: string;
};

// ─── Login ───────────────────────────────────────────────────

export const login = async (input: LoginRequest): Promise<LoginResponse> => {
	const response = await apiClient.post<BackendLoginResponse>(
		API_ENDPOINTS.auth.login,
		{
			email: input.email,
			password: input.password,
		}
	);

	const d = response.data;

	const role = (d.role === 'vendor' || d.role === 'admin') ? d.role : 'user';

	return {
		token: d.token,
		role,
		name: `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() || d.email,
		email: d.email,
		first_name: d.first_name ?? '',
		last_name: d.last_name ?? '',
		user_id: d.user_id,
	};
};

// ─── Register ────────────────────────────────────────────────

export const register = async (input: RegisterRequest): Promise<RegisterResponse> => {
	const response = await apiClient.post<BackendRegisterResponse>(
		API_ENDPOINTS.auth.register,
		{
			first_name: input.firstName,
			last_name: input.lastName,
			email: input.email,
			password: input.password,   // backend hashes it (field name: password_hash in DB but controller reads req.body.password)
			phone: input.phone,
			user_type: input.userType,
		}
	);

	return {
		success: true,
		message: response.data.message ?? 'Registration successful!',
		userId: response.data.userId,
		requiresVerification: response.data.requiresVerification ?? false,
	};
};

// ─── Forgot Password ─────────────────────────────────────────

export const forgotPassword = async (email: string): Promise<string> => {
	const response = await apiClient.post<BackendForgotPasswordResponse>(
		API_ENDPOINTS.auth.forgotPassword,
		{ email }
	);

	return (
		response.data.message ??
		'If an account exists with this email, you will receive a reset link shortly.'
	);
};
