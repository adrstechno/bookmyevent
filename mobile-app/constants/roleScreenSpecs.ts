export type RoleScreenSpec = {
	loadingText: string;
	sections: Array<{ title: string; lines: string[] }>;
	buttons: string[];
};

export const roleScreenSpecs: Record<string, RoleScreenSpec> = {
	'vendor-dashboard': {
		loadingText: 'Loading dashboard...',
		sections: [
			{ title: 'KPI Cards', lines: ['Total Sales', 'New Orders', 'Active Events', 'Total Clients'] },
			{ title: 'Recent Activities', lines: ['Booking status timeline', 'Customer updates', 'Event schedule notes'] },
		],
		buttons: ['Complete Profile Setup', 'Home', 'Settings'],
	},
	'vendor-bookings': {
		loadingText: 'Loading bookings...',
		sections: [
			{ title: 'Filters', lines: ['All', 'Pending', 'Accepted', 'Confirmed', 'Completed', 'Cancelled'] },
			{ title: 'Booking Actions', lines: ['Accept/Reject decision flow', 'OTP verification and cancellation flow'] },
		],
		buttons: ['Accept', 'Reject', 'Verify OTP', 'Cancel', 'Refresh'],
	},
	'vendor-shifts': {
		loadingText: 'Loading shifts...',
		sections: [
			{ title: 'Shift Form', lines: ['Shift Name', 'Start Time', 'End Time', 'Days of week'] },
			{ title: 'Shift Table', lines: ['Shift listing with edit and delete actions'] },
		],
		buttons: ['Add Shift', 'Edit Shift', 'Delete Shift'],
	},
	'vendor-events': {
		loadingText: 'Loading events...',
		sections: [
			{ title: 'Events', lines: ['Event list cards', 'Status and schedule details'] },
		],
		buttons: ['Add Event', 'Edit Event', 'Delete Event'],
	},
	'vendor-gallery': {
		loadingText: 'Loading gallery...',
		sections: [
			{ title: 'Image Upload', lines: ['Drag/drop style upload zone', 'Preview grid with remove action'] },
		],
		buttons: ['Select Images', 'Upload', 'Remove Image'],
	},
	'vendor-packages': {
		loadingText: 'Loading packages...',
		sections: [
			{ title: 'Package Catalog', lines: ['Price and feature cards', 'Active and inactive package states'] },
		],
		buttons: ['Add Package', 'Edit Package', 'Delete Package'],
	},
	'vendor-reservations': {
		loadingText: 'Loading reservations...',
		sections: [
			{ title: 'Manual Reservations', lines: ['Customer details', 'Service schedule', 'Reservation status'] },
		],
		buttons: ['Create Reservation', 'Cancel Reservation', 'Edit'],
	},
	'vendor-settings': {
		loadingText: 'Loading settings...',
		sections: [
			{ title: 'Account Settings', lines: ['Business details', 'Password controls', 'Preferences'] },
		],
		buttons: ['Update Profile', 'Change Password', 'Save Changes'],
	},
	'admin-dashboard': {
		loadingText: 'Loading dashboard...',
		sections: [
			{ title: 'KPI Cards', lines: ['Total Users', 'Total Bookings', 'Revenue', 'Total Vendors'] },
			{ title: 'Recent Activities', lines: ['Platform operations timeline', 'Top vendor signals'] },
		],
		buttons: ['Refresh'],
	},
	'admin-users': {
		loadingText: 'Loading users...',
		sections: [
			{ title: 'User Management', lines: ['Role-based filters', 'Status toggles', 'Pagination controls'] },
		],
		buttons: ['Users', 'Vendors', 'Marketer', 'Activate', 'Deactivate'],
	},
	'admin-services': {
		loadingText: 'Loading services...',
		sections: [
			{ title: 'Services', lines: ['Service list and status', 'Create and update service flows'] },
		],
		buttons: ['Add Service', 'Edit Service', 'Delete Service'],
	},
	'admin-main-services': {
		loadingText: 'Loading main services...',
		sections: [
			{ title: 'Main Services', lines: ['Top-level category controls', 'Ordering and visibility'] },
		],
		buttons: ['Add Main Service', 'Edit Main Service', 'Delete Main Service'],
	},
	'admin-bookings': {
		loadingText: 'Loading bookings...',
		sections: [
			{ title: 'Booking Queue', lines: ['Pending approvals', 'Approved and completed tracking'] },
		],
		buttons: ['Approve', 'Reject', 'Refresh'],
	},
	'admin-reservations': {
		loadingText: 'Loading reservations...',
		sections: [
			{ title: 'Manual Reservations', lines: ['Create and cancel reservation flow', 'Date/time controls'] },
		],
		buttons: ['Create Reservation', 'Cancel Reservation', 'Edit'],
	},
	'admin-subscriptions': {
		loadingText: 'Loading subscriptions...',
		sections: [
			{ title: 'Subscription Monitoring', lines: ['Renewal and expiry tracking', 'Plan status overview'] },
		],
		buttons: ['Refresh', 'Export'],
	},
	'admin-analytics': {
		loadingText: 'Loading analytics...',
		sections: [
			{ title: 'Platform Analytics', lines: ['Conversion trends', 'Revenue and performance insights'] },
		],
		buttons: ['Refresh', 'Export'],
	},
};
