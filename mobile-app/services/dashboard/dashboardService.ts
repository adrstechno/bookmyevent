import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { UserKpis } from '@/types/catalog';

export const fetchUserKpis = async (): Promise<UserKpis> => {
	const response = await apiClient.get<{
		total_bookings?: number;
		total_spent?: number;
		pending_bookings?: number;
		completed_bookings?: number;
		data?: {
			total_bookings?: number;
			total_spent?: number;
			pending_bookings?: number;
			completed_bookings?: number;
		};
	}>(API_ENDPOINTS.dashboard.userKpis);

	const payload = response.data.data ?? response.data;

	return {
		totalBookings: payload.total_bookings ?? 0,
		totalSpent: payload.total_spent ?? 0,
		pendingBookings: payload.pending_bookings ?? 0,
		completedBookings: payload.completed_bookings ?? 0,
	};
};
