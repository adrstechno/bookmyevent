export type UserRole = 'user' | 'vendor' | 'admin';

export type AuthUser = {
	uuid: string;
	email: string;
	first_name: string;
	last_name?: string;
	user_type: UserRole;
	is_verified?: boolean;
};

export type ApiResponse<T = unknown> = {
	success?: boolean;
	message?: string;
	data?: T;
};

export type LoginRequest = {
	email: string;
	password: string;
};

export type LoginResponse = {
	message: string;
	token: string;
	role: UserRole;
	user_id: string;
	email: string;
	first_name: string;
	last_name?: string;
	requiresVerification?: boolean;
};

export type RegisterRequest = {
	first_name: string;
	last_name?: string;
	email: string;
	phone: string;
	password: string;
	user_type: Extract<UserRole, 'user' | 'vendor'>;
};

export type RegisterResponse = {
	message: string;
	userId?: number;
	requiresVerification?: boolean;
};

export type ValidateTokenResponse = {
	success: boolean;
	message: string;
	user: AuthUser;
};

export type ForgotPasswordRequest = {
	email: string;
};

export type ForgotPasswordResponse = {
	success: boolean;
	message: string;
};

export type VerifyResetTokenResponse = {
	success: boolean;
	message: string;
};

export type ResetPasswordRequest = {
	token: string;
	newPassword: string;
	confirmPassword: string;
};

export type ResetPasswordResponse = {
	success: boolean;
	message: string;
};

export type VerifyEmailResponse = {
	success: boolean;
	message: string;
};

export type ResendVerificationRequest = {
	email: string;
};

export type ResendVerificationResponse = {
	success: boolean;
	message: string;
};
