export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type BookingItem = {
	id: string;
	eventName: string;
	date: string;
	venue: string;
	amount: string;
	status: BookingStatus;
};