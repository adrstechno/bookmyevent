import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';

type AppTopBarProps = {
	title: string;
	onBackPress: () => void;
};

export function AppTopBar({ title, onBackPress }: AppTopBarProps) {
	const { palette } = useSettingsTheme();

	return (
		<View style={[styles.header, { backgroundColor: palette.surfaceBg, borderBottomColor: palette.border }]}>
			<Pressable
				style={[styles.backBtn, { backgroundColor: palette.headerBtnBg, borderColor: palette.border }]}
				onPress={onBackPress}
				hitSlop={10}
			>
				<Ionicons name="arrow-back" size={20} color={palette.text} />
			</Pressable>
			<ThemedText style={[styles.headerTitle, { color: palette.text }]}>{title}</ThemedText>
			<View style={styles.headerRightPlaceholder} />
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		height: 56,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '800',
	},
	headerRightPlaceholder: {
		width: 36,
		height: 36,
	},
});