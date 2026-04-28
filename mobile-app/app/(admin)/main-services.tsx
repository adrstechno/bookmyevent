import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function AdminMainServicesScreen() {
	return (
		<ModulePlaceholder
			title="Admin Main Services"
			description="Manage top-level service categories and availability for the platform."
			role="admin"
			screenKey="admin-main-services"
			nextActions={[
				'Load main service list from admin main-service endpoint',
				'Add create, edit, and delete actions for main services',
				'Connect status toggles and ordering controls',
			]}
		/>
	);
}
