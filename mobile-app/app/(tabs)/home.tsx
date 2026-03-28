import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeTabScreen() {
	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Dashboard</ThemedText>
			<ThemedText>This screen is ready for your mobile dashboard widgets.</ThemedText>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		gap: 8,
	},
});

