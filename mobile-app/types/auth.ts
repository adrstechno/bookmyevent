export type LoginRequest = {
	email: string;
	password: string;
	userType: 'user' | 'vendor';
};

export type LoginResponse = {
	token: string;
	role: 'user' | 'vendor';
	name: string;
	email: string;
};

export type RegisterRequest = {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
	userType: 'user' | 'vendor';
};

export type RegisterResponse = {
	success: boolean;
	message: string;
	userId?: number | string;
	uuid?: string;
};
