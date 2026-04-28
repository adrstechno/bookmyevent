import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';

type TabsTopBarProps = {
	title: string;
	rightContent?: ReactNode;
};

export function TabsTopBar({ title, rightContent }: TabsTopBarProps) {
	const { palette } = useSettingsTheme();

	return (
		<View style={[styles.header, { backgroundColor: palette.surfaceBg, borderBottomColor: palette.border }]}>
			<View style={styles.leftSlot}>
				<AppMenuDrawer />
			</View>
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
		alignItems: 'flex-start',
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
		width: 36,
		height: 36,
	},
});