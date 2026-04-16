import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import FadeInView from '@/components/common/FadeInView';
import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';

type PageLoadingStateProps = {
	text: string;
};

export default function PageLoadingState({ text }: PageLoadingStateProps) {
	const { palette } = useSettingsTheme();

	return (
		<FadeInView style={[styles.wrap, { backgroundColor: palette.screenBg }]}>
			<View style={styles.logoWrap}>
				<Image
					source={require('@/assets/images/login_logo.png')}
					style={styles.logo}
					resizeMode="contain"
				/>
			</View>
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
		gap: 16,
		paddingHorizontal: 20,
	},
	logoWrap: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 200,
		height: 120,
		borderRadius: 18,
		backgroundColor: 'transparent',
		marginBottom: 8,
	},
	logo: {
		width: '100%',
		height: '100%',
		borderRadius: 18,
		backgroundColor: 'transparent',
	},
	text: {
		fontSize: 15,
		fontWeight: '700',
	},
});
