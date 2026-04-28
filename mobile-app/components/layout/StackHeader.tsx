import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';

type StackHeaderProps = {
	title: string;
	rightContent?: ReactNode;
	onBackPress?: () => void;
};

export function StackHeader({ title, rightContent, onBackPress }: StackHeaderProps) {
	const router = useRouter();
	const { palette } = useSettingsTheme();

	const handleBackPress = () => {
		if (onBackPress) {
			onBackPress();
		} else {
			router.back();
		}
	};

	return (
		<View style={[styles.header, { backgroundColor: palette.surfaceBg, borderBottomColor: palette.border }]}>
			<Pressable style={styles.leftSlot} onPress={handleBackPress} hitSlop={8}>
				<Ionicons name="chevron-back" size={24} color={palette.text} />
			</Pressable>
			<ThemedText style={[styles.title, { color: palette.text }]} numberOfLines={1}>
				{title}
			</ThemedText>
			<View style={styles.rightSlot}>{rightContent ?? <View style={styles.placeholder} />}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		height: 56,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		borderBottomWidth: 1,
	},
	leftSlot: {
		width: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		flex: 1,
		fontSize: 20,
		fontWeight: '800',
		textAlign: 'center',
		paddingHorizontal: 8,
	},
	rightSlot: {
		width: 40,
		alignItems: 'flex-end',
	},
	placeholder: {
		width: 24,
		height: 24,
	},
});
