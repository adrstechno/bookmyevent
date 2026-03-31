import { ScrollView, StyleSheet } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const CATEGORIES = [
	'Wedding Event',
	'Birthday Party Event',
	'Kitty Party Event',
	'Bhagwat Katha Event',
	'Office Seminar and Conference',
	'Concert and Live Show',
	'Exhibition and Trade Fair',
	'Fashion and Media Event',
];

export default function CategoriesTabScreen() {
	const tabBarHeight = useBottomTabBarHeight();

	return (
		<ScrollView
			style={styles.page}
			contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
		>
			<ThemedText type="title" style={styles.pageTitle}>Categories</ThemedText>
			<ThemedText style={styles.pageSubtitle}>Browse event categories available in BookMyEvent.</ThemedText>

			{CATEGORIES.map((category, index) => (
				<ThemedView key={category} style={styles.rowCard}>
					<ThemedView style={styles.badge}>
						<ThemedText style={styles.badgeText}>{index + 1}</ThemedText>
					</ThemedView>
					<ThemedText type="defaultSemiBold" style={styles.rowText}>
						{category}
					</ThemedText>
				</ThemedView>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	page: {
		flex: 1,
		backgroundColor: '#F4F7F9',
	},
	container: {
		padding: 20,
		gap: 12,
	},
	pageTitle: {
		fontSize: 28,
		fontWeight: '800',
		color: '#0F172A',
	},
	pageSubtitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#334155',
		marginTop: -2,
	},
	rowCard: {
		borderWidth: 1,
		borderColor: '#E2E8F0',
		borderRadius: 12,
		padding: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	badge: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#0A7EA4',
		alignItems: 'center',
		justifyContent: 'center',
	},
	badgeText: {
		color: '#FFFFFF',
		fontWeight: '700',
		fontSize: 12,
	},
	rowText: {
		flex: 1,
	},
});
