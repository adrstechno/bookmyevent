import { ActivityIndicator, StyleSheet } from 'react-native';

import FadeInView from '@/components/common/FadeInView';
import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';

type PageLoadingStateProps = {
	text: string;
};

export default function PageLoadingState({ text }: PageLoadingStateProps) {
	const { palette } = useSettingsTheme();

	return (
		<FadeInView style={styles.wrap}>
			<ActivityIndicator size="large" color={palette.primary} />
			<ThemedText style={[styles.text, { color: palette.subtext }]}>{text}</ThemedText>
		</FadeInView>
	);
}

const styles = StyleSheet.create({
	wrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		paddingHorizontal: 20,
	},
	text: {
		fontSize: 15,
		fontWeight: '700',
	},
});
