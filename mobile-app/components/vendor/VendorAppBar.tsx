import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import AppMenuDrawer from '@/components/layout/AppMenuDrawer';
import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';

interface VendorAppBarProps {
	title: string;
	actionIcon?: keyof typeof Ionicons.glyphMap;
	onAction?: () => void;
	actionElement?: React.ReactNode;
}

export default function VendorAppBar({
	title,
	actionIcon,
	onAction,
	actionElement,
}: VendorAppBarProps) {
	const { palette, mode } = useSettingsTheme();
	const isDark = mode === 'dark';

	const overlayBg   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)';
	const overlayBdr  = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.32)';
	const dividerClr  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

	return (
		<View style={[s.bar, { backgroundColor: palette.primary }]}>

			{/* decorative top-right glow blob */}
			<View style={[s.glowBlob, { backgroundColor: overlayBg }]} pointerEvents="none" />

			<View style={s.inner}>

				{/* ── Left: hamburger ── */}
				<AppMenuDrawer variant="onPrimary" />

				{/* ── Center: title ── */}
				<View style={s.titleWrap}>
					<ThemedText style={[s.title, { color: palette.onPrimary }]} numberOfLines={1}>
						{title}
					</ThemedText>
				</View>

				{/* ── Right: action ── */}
				{actionElement ?? (
					actionIcon && onAction ? (
						<Pressable
							style={({ pressed }) => [
								s.iconBtn,
								{
									backgroundColor: pressed ? overlayBdr : overlayBg,
									borderColor: overlayBdr,
								},
							]}
							onPress={onAction}
						>
							<Ionicons name={actionIcon} size={18} color={palette.onPrimary} />
						</Pressable>
					) : (
						<View style={s.iconBtn} />
					)
				)}
			</View>

			{/* bottom divider */}
			<View style={[s.divider, { backgroundColor: dividerClr }]} />
		</View>
	);
}

const SHADOW = Platform.select({
	ios: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 6,
	},
	android: { elevation: 4 },
	default: {},
});

const s = StyleSheet.create({
	bar: {
		width: '100%',
		...SHADOW,
	},
	glowBlob: {
		position: 'absolute',
		top: -20,
		right: -20,
		width: 120,
		height: 120,
		borderRadius: 60,
	},
	inner: {
		height: 58,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		gap: 12,
	},
	titleWrap: {
		flex: 1,
	},
	title: {
		fontSize: 18,
		fontWeight: '800',
		letterSpacing: 0.2,
	},
	iconBtn: {
		width: 38,
		height: 38,
		borderRadius: 12,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: 'transparent',
	},
	divider: {
		height: 1,
		marginHorizontal: 0,
	},
});
