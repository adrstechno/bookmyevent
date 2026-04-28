import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function AdminBookingsScreen() {
	return (
		<ModulePlaceholder
			title="Admin Bookings"
			description="Booking moderation and approval queue for administrators."
			role="admin"
			screenKey="admin-bookings"
			nextActions={[
				'Load all bookings from admin booking endpoint',
				'Implement approve/reject actions with confirmation',
				'Show status timeline and audit metadata',
			]}
		/>
	);
}
