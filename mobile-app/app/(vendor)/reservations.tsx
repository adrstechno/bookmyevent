import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function VendorReservationsScreen() {
	return (
		<ModulePlaceholder
			title="Vendor Reservations"
			description="Manual reservation management for vendor operations."
			role="vendor"
			screenKey="vendor-reservations"
			nextActions={[
				'Connect manual reservation list and delete APIs',
				'Add reservation detail cards and status chips',
				'Support date range filtering',
			]}
		/>
	);
}
