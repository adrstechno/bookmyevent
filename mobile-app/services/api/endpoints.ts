import apiClient from '@/services/api/client';
import {
	ForgotPasswordRequest,
	ForgotPasswordResponse,
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse,
	ResendVerificationRequest,
	ResendVerificationResponse,
	ResetPasswordRequest,
	ResetPasswordResponse,
	ValidateTokenResponse,
	VerifyEmailResponse,
	VerifyResetTokenResponse,
} from '@/types';

export const authEndpoints = {
	login: async (payload: LoginRequest) => {
		const response = await apiClient.post<LoginResponse>('/User/Login', payload);
		return response.data;
	},
	register: async (payload: RegisterRequest) => {
		const response = await apiClient.post<RegisterResponse>('/User/InsertUser', payload);
		return response.data;
	},
	logout: async () => {
		const response = await apiClient.post<{ message: string }>('/User/Logout');
		return response.data;
	},
	validateToken: async () => {
		const response = await apiClient.post<ValidateTokenResponse>('/User/validate-token');
		return response.data;
	},
	forgotPassword: async (payload: ForgotPasswordRequest) => {
		const response = await apiClient.post<ForgotPasswordResponse>('/User/forgot-password', payload);
		return response.data;
	},
	verifyResetToken: async (token: string) => {
		const response = await apiClient.get<VerifyResetTokenResponse>('/User/verify-reset-token', {
			params: { token },
		});
		return response.data;
	},
	resetPassword: async (payload: ResetPasswordRequest) => {
		const response = await apiClient.post<ResetPasswordResponse>('/User/reset-password', payload);
		return response.data;
	},
	verifyEmail: async (token: string) => {
		const response = await apiClient.get<VerifyEmailResponse>('/User/verify-email', {
			params: { token },
		});
		return response.data;
	},
	resendVerification: async (payload: ResendVerificationRequest) => {
		const response = await apiClient.post<ResendVerificationResponse>(
			'/User/resend-verification',
			payload
		);
		return response.data;
	},
};
