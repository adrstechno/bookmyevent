import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SettingsTabScreen() {
	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Settings</ThemedText>
			<ThemedText>Theme and app preferences can be managed here.</ThemedText>
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

