// ─── Request types ───────────────────────────────────────────
export type LoginRequest = {
	email: string;
	password: string;
};

export type RegisterRequest = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone: string;
	userType: 'user' | 'vendor';
};

// ─── Response types (match backend exactly) ──────────────────
export type LoginResponse = {
	token: string;
	role: 'user' | 'vendor' | 'admin';
	name: string;
	email: string;
	first_name: string;
	last_name: string;
	user_id: string;
};

export type RegisterResponse = {
	success: boolean;
	message: string;
	userId?: number | string;
	requiresVerification?: boolean;
};
