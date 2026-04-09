import * as SecureStore from 'expo-secure-store';

const FAVORITES_KEY = 'user.favorites.events';

export type FavoriteEvent = {
	id: string;
	title: string;
	description: string;
};

const parseFavorites = (rawValue: string | null): FavoriteEvent[] => {
	if (!rawValue) {
		return [];
	}

	try {
		const parsed = JSON.parse(rawValue) as FavoriteEvent[];
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed.filter((item) => Boolean(item?.id && item?.title && item?.description));
	} catch {
		return [];
	}
};

const saveFavorites = async (items: FavoriteEvent[]) => {
	try {
		await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(items));
	} catch {
		// Keep UX responsive even when secure storage is unavailable.
	}
};

export const favoritesService = {
	async getAll(): Promise<FavoriteEvent[]> {
		try {
			const rawValue = await SecureStore.getItemAsync(FAVORITES_KEY);
			return parseFavorites(rawValue);
		} catch {
			return [];
		}
	},

	async isFavorite(eventId: string): Promise<boolean> {
		const items = await this.getAll();
		return items.some((item) => item.id === eventId);
	},

	async setFavorite(event: FavoriteEvent, isFavorite: boolean): Promise<FavoriteEvent[]> {
		const current = await this.getAll();
		const withoutCurrent = current.filter((item) => item.id !== event.id);
		const next = isFavorite ? [event, ...withoutCurrent] : withoutCurrent;
		await saveFavorites(next);
		return next;
	},
};
