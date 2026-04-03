import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function VendorSettingsScreen() {
	return (
		<ModulePlaceholder
			title="Vendor Settings"
			description="Vendor-specific account, subscription, and business settings."
			role="vendor"
			screenKey="vendor-settings"
			nextActions={[
				'Show subscription status and renewal CTA',
				'Add account and notification preferences',
				'Connect change password and support actions',
			]}
		/>
	);
}
