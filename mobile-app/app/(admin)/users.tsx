import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function AdminUsersScreen() {
	return (
		<ModulePlaceholder
			title="Admin Users"
			description="Platform user management with role and status visibility."
			role="admin"
			screenKey="admin-users"
			nextActions={[
				'Load users from admin/users endpoint',
				'Add filter and search controls',
				'Support role and status actions',
			]}
		/>
	);
}
