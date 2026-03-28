import * as SecureStore from 'expo-secure-store';

import { clearApiAuthToken, setApiAuthToken } from '@/services/api/client';

const ACCESS_TOKEN_KEY = 'auth.accessToken';

let inMemoryToken: string | null = null;

const setStoredToken = async (token: string) => {
	inMemoryToken = token;

	try {
		await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
	} catch {
		// Web and some simulators may not provide secure storage.
	}
};

const getStoredToken = async () => {
	try {
		const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
		return token ?? inMemoryToken;
	} catch {
		return inMemoryToken;
	}
};

const clearStoredToken = async () => {
	inMemoryToken = null;

	try {
		await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
	} catch {
		// Ignore storage delete issues to keep logout reliable.
	}
};

export const restoreSession = async () => {
	const token = await getStoredToken();

	if (token) {
		setApiAuthToken(token);
	} else {
		clearApiAuthToken();
	}

	return token;
};

export const persistSessionToken = async (token: string) => {
	await setStoredToken(token);
	setApiAuthToken(token);
};

export const clearSession = async () => {
	await clearStoredToken();
	clearApiAuthToken();
};

