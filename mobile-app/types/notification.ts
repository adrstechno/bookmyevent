export type NotificationStatusFilter = 'all' | 'read' | 'unread';

export type NotificationItem = {
	id: number | string;
	user_id?: number | string;
	title: string;
	message: string;
	type?: string | null;
	related_booking_id?: number | string | null;
	is_read: boolean;
	created_at: string;
};

export type NotificationListData = {
	notifications: NotificationItem[];
	pagination: {
		page: number;
		limit: number;
		hasMore: boolean;
	};
	unreadCount: number;
};