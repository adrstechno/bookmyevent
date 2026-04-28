import type { UserRole } from '@/services/auth/authService';

export const getRoleHomeRoute = (role: UserRole | null) => {
	if (role === 'vendor') {
		return '/(vendor)/dashboard';
	}

	// user (and any other role) → main tabs
	return '/(tabs)/home';
};

export const isValidRole = (value: string | null | undefined): value is UserRole => {
	return value === 'user' || value === 'vendor';
};
