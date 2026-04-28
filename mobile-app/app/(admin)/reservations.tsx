import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function AdminReservationsScreen() {
	return (
		<ModulePlaceholder
			title="Admin Reservations"
			description="Manual reservation creation and cancellation controls."
			role="admin"
			screenKey="admin-reservations"
			nextActions={[
				'Connect manual reservation create and delete endpoints',
				'Add vendor and date selection flow',
				'Show reservation operation history',
			]}
		/>
	);
}
