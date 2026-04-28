import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function AdminSubscriptionsScreen() {
	return (
		<ModulePlaceholder
			title="Admin Subscriptions"
			description="Subscription overview and renewal monitoring for vendors."
			role="admin"
			screenKey="admin-subscriptions"
			nextActions={[
				'Load subscription data and stats endpoints',
				'Add expiring and expired filters',
				'Support manual status refresh actions',
			]}
		/>
	);
}
