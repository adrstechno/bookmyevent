import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'auth.session';

export type UserRole = 'user' | 'vendor' | 'admin';

export type AuthSession = {
	token: string;
	role: UserRole;
	name: string;
	email: string;
};

let inMemorySession: AuthSession | null = null;

const decodeJwtPayload = (token: string) => {
	try {
		const payloadPart = token.split('.')[1];
		if (!payloadPart) return null;

		const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
		const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
		const base64 = `${normalized}${padding}`;

		if (typeof atob === 'function') {
			return JSON.parse(atob(base64)) as { exp?: number };
		}
	} catch {
		return null;
	}
};

export const isAuthTokenExpired = (token: string | null | undefined) => {
	if (!token) return true;

	const payload = decodeJwtPayload(token);
	if (!payload?.exp) return false;

	return payload.exp * 1000 <= Date.now();
};

const setStoredSession = async (session: AuthSession) => {
	inMemorySession = session;

	try {
		await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
	} catch {
		// Web and some simulators may not provide secure storage.
	}
};

const getStoredSession = async () => {
	try {
		const session = await SecureStore.getItemAsync(SESSION_KEY);

		if (!session) {
			return inMemorySession;
		}

		return JSON.parse(session) as AuthSession;
	} catch {
		return inMemorySession;
	}
};

const clearStoredSession = async () => {
	inMemorySession = null;

	try {
		await SecureStore.deleteItemAsync(SESSION_KEY);
	} catch {
		// Ignore storage delete issues to keep logout reliable.
	}
};

export const restoreSession = async () => {
	const session = await getStoredSession();
	if (!session?.token) {
		return session;
	}

	if (isAuthTokenExpired(session.token)) {
		await clearStoredSession();
		return null;
	}

	return session;
};

export const persistSession = async (session: AuthSession) => {
	await setStoredSession(session);
};

export const clearSession = async () => {
	await clearStoredSession();
};
