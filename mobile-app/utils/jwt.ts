type JwtPayload = {
	exp?: number;
};

const decodeBase64Url = (value: string): string | null => {
	const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
	const paddingLength = (4 - (normalized.length % 4)) % 4;
	const padded = `${normalized}${'='.repeat(paddingLength)}`;

	if (typeof globalThis.atob !== 'function') {
		return null;
	}

	try {
		return globalThis.atob(padded);
	} catch {
		return null;
	}
};

export const getTokenExpiryTimeMs = (token: string): number | null => {
	const parts = token.split('.');
	if (parts.length < 2) {
		return null;
	}

	const encodedPayload = parts[1];
	const decodedPayload = decodeBase64Url(encodedPayload);

	if (!decodedPayload) {
		return null;
	}

	try {
		const payload = JSON.parse(decodedPayload) as JwtPayload;
		if (typeof payload.exp !== 'number' || Number.isNaN(payload.exp)) {
			return null;
		}

		return payload.exp * 1000;
	} catch {
		return null;
	}
};

export const isTokenExpired = (token: string, skewMs = 5000): boolean => {
	const expiryTimeMs = getTokenExpiryTimeMs(token);
	if (!expiryTimeMs) {
		return false;
	}

	return Date.now() >= expiryTimeMs - skewMs;
};