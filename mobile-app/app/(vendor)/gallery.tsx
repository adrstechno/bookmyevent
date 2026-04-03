import ModulePlaceholder from '@/components/role/ModulePlaceholder';

export default function VendorGalleryScreen() {
	return (
		<ModulePlaceholder
			title="Vendor Gallery"
			description="Event image management for vendor profile showcase."
			role="vendor"
			screenKey="vendor-gallery"
			nextActions={[
				'Load gallery from GetvendorEventImages',
				'Add mobile upload, preview, and remove actions',
				'Optimize images for low bandwidth',
			]}
		/>
	);
}
