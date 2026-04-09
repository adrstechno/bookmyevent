import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { executeApi, extractListFromPayload, unwrapApiPayload, type ApiResult } from '@/services/api/result';
import type {
	NotificationItem,
	NotificationListData,
	NotificationStatusFilter,
} from '@/types/notification';

type NotificationQuery = {
	page?: number;
	limit?: number;
	status?: NotificationStatusFilter;
};

const toNotificationItem = (item: Record<string, unknown>): NotificationItem => {
	return {
		id: item.id ?? item.notification_id ?? '',
		user_id: item.user_id as number | string | undefined,
		title: typeof item.title === 'string' ? item.title : 'Notification',
		message: typeof item.message === 'string' ? item.message : '',
		type: typeof item.type === 'string' ? item.type : null,
		related_booking_id: item.related_booking_id ?? null,
		is_read: Boolean(item.is_read),
		created_at: typeof item.created_at === 'string' ? item.created_at : new Date().toISOString(),
	};
};

const toNumber = (value: unknown, fallback: number) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const toPagination = (payload: Record<string, unknown>, page: number, limit: number) => {
	const pagination = payload.pagination;
	if (pagination && typeof pagination === 'object') {
		const typed = pagination as Record<string, unknown>;
		return {
			page: toNumber(typed.page, page),
			limit: toNumber(typed.limit, limit),
			hasMore: Boolean(typed.hasMore),
		};
	}

	return {
		page,
		limit,
		hasMore: false,
	};
};

export const notificationService = {
	getNotifications: async (params: NotificationQuery = {}): Promise<ApiResult<NotificationListData>> => {
		return executeApi(async () => {
			const page = params.page ?? 1;
			const limit = params.limit ?? 15;
			const query: Record<string, number | string> = { page, limit };

			if (params.status && params.status !== 'all') {
				query.status = params.status;
			}

			const response = await apiClient.get(API_ENDPOINTS.notification.all, {
				params: query,
			});

			const payload = unwrapApiPayload<unknown>(response.data);
			const payloadObject = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
			const notifications = extractListFromPayload<Record<string, unknown>>(payload, ['notifications']);
			const unreadCount = toNumber(payloadObject.unreadCount ?? payloadObject.count, 0);

			return {
				notifications: notifications.map(toNotificationItem),
				pagination: toPagination(payloadObject, page, limit),
				unreadCount,
			};
		}, 'Unable to load notifications right now.');
	},

	getUnreadCount: async (): Promise<ApiResult<number>> => {
		return executeApi(async () => {
			const response = await apiClient.get(API_ENDPOINTS.notification.unreadCount);
			const payload = unwrapApiPayload<unknown>(response.data);
			const payloadObject = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
			return toNumber(payloadObject.unreadCount ?? payloadObject.count, 0);
		}, 'Unable to load unread notification count right now.');
	},

	markAsRead: async (notificationId: number | string): Promise<ApiResult<void>> => {
		return executeApi(async () => {
			await apiClient.put(API_ENDPOINTS.notification.markRead(notificationId));
		}, 'Unable to mark notification as read.');
	},

	markAllAsRead: async (): Promise<ApiResult<void>> => {
		return executeApi(async () => {
			await apiClient.put(API_ENDPOINTS.notification.markAllRead);
		}, 'Unable to mark all notifications as read.');
	},

	archiveNotification: async (notificationId: number | string): Promise<ApiResult<void>> => {
		return executeApi(async () => {
			await apiClient.put(API_ENDPOINTS.notification.archive(notificationId));
		}, 'Unable to archive notification.');
	},

	deleteNotification: async (notificationId: number | string): Promise<ApiResult<void>> => {
		return executeApi(async () => {
			await apiClient.delete(API_ENDPOINTS.notification.delete(notificationId));
		}, 'Unable to delete notification.');
	},
};

export default notificationService;