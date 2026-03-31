import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types/auth';

type BackendAuthResponse = {
	token?: string;
	access_token?: string;
	message?: string;
	success?: boolean;
	user_id?: number | string;
	uuid?: string;
	user_type?: string;
	data?: {
		token?: string;
		access_token?: string;
		user_id?: number | string;
		uuid?: string;
		user_type?: string;
	};
};

const extractToken = (payload: BackendAuthResponse): string => {
	const token = payload.token ?? payload.access_token ?? payload.data?.token ?? payload.data?.access_token;

	if (!token) {
		throw new Error('Login response did not include an access token.');
	}

	return token;
};

export const login = async (input: LoginRequest): Promise<LoginResponse> => {
	const response = await apiClient.post<BackendAuthResponse>(API_ENDPOINTS.auth.login, {
		email: input.email,
		password: input.password,
	});

	const payload = response.data;

	return {
		token: extractToken(payload),
		userId: payload.user_id ?? payload.data?.user_id,
		uuid: payload.uuid ?? payload.data?.uuid,
		userType: payload.user_type ?? payload.data?.user_type,
		message: payload.message,
	};
};

export const register = async (input: RegisterRequest): Promise<RegisterResponse> => {
	const response = await apiClient.post<{
		success?: boolean;
		message?: string;
		user_id?: number | string;
		uuid?: string;
	}>(API_ENDPOINTS.auth.register, {
		email: input.email,
		password_hash: input.password,
		first_name: input.firstName ?? '',
		last_name: input.lastName ?? '',
		phone: input.phone ?? '',
		user_type: input.userType ?? 'user',
	});

	return {
		success: response.data.success ?? true,
		message: response.data.message ?? 'Registration successful. Please login.',
		userId: response.data.user_id,
		uuid: response.data.uuid,
	};
};
