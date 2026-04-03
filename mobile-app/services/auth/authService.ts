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
	return await getStoredSession();
};

export const persistSession = async (session: AuthSession) => {
	await setStoredSession(session);
};

export const clearSession = async () => {
	await clearStoredSession();
};

