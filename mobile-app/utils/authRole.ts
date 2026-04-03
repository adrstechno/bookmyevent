import type { UserRole } from '@/services/auth/authService';

export const getRoleHomeRoute = (role: UserRole | null) => {
	if (role === 'admin') {
		return '/(admin)/dashboard';
	}

	if (role === 'vendor') {
		return '/(vendor)/dashboard';
	}

	return '/(tabs)/home';
};

export const isValidRole = (value: string | null | undefined): value is UserRole => {
	return value === 'user' || value === 'vendor' || value === 'admin';
};
