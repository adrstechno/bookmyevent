import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function AdminAnalyticsScreen() {
	return (
		<ModulePlaceholder
			title="Admin Analytics"
			description="Cross-platform insights for booking conversion, vendor performance, and user growth."
			role="admin"
			screenKey="admin-analytics"
			nextActions={[
				'Connect dashboard charts to analytics APIs',
				'Add date range and service category filters',
				'Enable export for monthly admin reports',
			]}
		/>
	);
}
