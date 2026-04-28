import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function AdminServicesScreen() {
	return (
		<ModulePlaceholder
			title="Admin Services"
			description="Service and main-service administration workflows."
			role="admin"
			screenKey="admin-services"
			nextActions={[
				'Connect service create, update, and delete endpoints',
				'Add service and subservice forms',
				'Support active/inactive service lifecycle',
			]}
		/>
	);
}
