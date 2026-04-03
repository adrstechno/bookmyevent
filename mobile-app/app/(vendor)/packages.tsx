import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function VendorPackagesScreen() {
	return (
		<ModulePlaceholder
			title="Vendor Packages"
			description="Package catalog CRUD for vendor offerings."
			role="vendor"
			screenKey="vendor-packages"
			nextActions={[
				'Connect insertVendorPackage and updateVendorPackage APIs',
				'Implement package card editor and price fields',
				'Support active/inactive package states',
			]}
		/>
	);
}
