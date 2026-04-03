import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function VendorProfileSetupScreen() {
	return (
		<ModulePlaceholder
			title="Vendor Profile Setup"
			description="Mobile version of vendor onboarding and profile management."
			role="vendor"
			nextActions={[
				'Connect Vendor/GetVendorProfile and Vendor/updateVendorProfile endpoints',
				'Port web form fields and image upload flow',
				'Add validation and sectioned form UX',
			]}
		/>
	);
}
