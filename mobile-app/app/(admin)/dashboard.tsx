import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function AdminDashboardScreen() {
	return (
		<ModulePlaceholder
			title="Admin Dashboard"
			description="Platform control center for users, service quality, and booking health."
			role="admin"
			screenKey="admin-dashboard"
			nextActions={[
				'Load admin overview metrics for users, vendors, and bookings',
				'Add moderation queue for reviews and reported listings',
				'Integrate subscription and payment signals in one timeline',
			]}
		/>
	);
}
