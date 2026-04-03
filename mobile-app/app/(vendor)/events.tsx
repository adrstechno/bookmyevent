import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function VendorEventsScreen() {
	return (
		<ModulePlaceholder
			title="Vendor Events"
			description="Vendor event list and performance view."
			role="vendor"
			screenKey="vendor-events"
			nextActions={[
				'Fetch vendor events and related images',
				'Add event detail and quick actions',
				'Support event status filtering',
			]}
		/>
	);
}
