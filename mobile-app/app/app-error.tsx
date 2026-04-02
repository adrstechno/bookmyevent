import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { DevSettings, Linking, Pressable, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/theme/useAppTheme';

export default function AppErrorScreen() {
	const router = useRouter();
	const { palette, resolvedMode } = useAppTheme();
	const isDark = resolvedMode === 'dark';
	const screenBg = isDark ? '#0F172A' : '#F8FAFC';
	const surfaceBg = isDark ? '#111827' : '#FFFFFF';
	const border = isDark ? '#334155' : '#E2E8F0';
	const supportPhone = '+91 98765 00000';
	const supportEmail = 'support@goeventify.demo';

	const onReloadApp = () => {
		if (__DEV__) {
			DevSettings.reload();
			return;
		}

		router.replace('/');
	};

	const onCallSupport = () => {
		Linking.openURL(`tel:${supportPhone.replace(/\s+/g, '')}`);
	};

	const onEmailSupport = () => {
		Linking.openURL(`mailto:${supportEmail}`);
	};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<View style={styles.contentWrap}>
				<View style={styles.iconCircle}>
					<Ionicons name="warning-outline" size={34} color="#DC2626" />
				</View>
				<ThemedText style={[styles.title, { color: palette.text }]}>Something went wrong</ThemedText>
				<ThemedText style={[styles.subtitle, { color: palette.icon }]}>An unexpected issue occurred. Please try again or go back to Profile.</ThemedText>

				<View style={styles.buttonRow}>
					<Pressable style={styles.primaryBtn} onPress={onReloadApp}>
						<ThemedText style={styles.primaryBtnText}>Reload App</ThemedText>
					</Pressable>
				</View>

				<View style={[styles.contactCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<ThemedText style={[styles.contactTitle, { color: palette.text }]}>You can contact us</ThemedText>
					<Pressable style={styles.contactRow} onPress={onCallSupport}>
						<View style={styles.contactLeft}>
							<Ionicons name="call-outline" size={16} color={palette.tint} />
							<View>
								<ThemedText style={[styles.contactText, { color: palette.text }]}>{supportPhone}</ThemedText>
								<ThemedText style={[styles.contactHint, { color: palette.icon }]}>Tap to call support</ThemedText>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={16} color={palette.icon} />
					</Pressable>
					<Pressable style={[styles.contactRow, styles.contactDivider]} onPress={onEmailSupport}>
						<View style={styles.contactLeft}>
							<Ionicons name="mail-outline" size={16} color={palette.tint} />
							<View>
								<ThemedText style={[styles.contactText, { color: palette.text }]}>{supportEmail}</ThemedText>
								<ThemedText style={[styles.contactHint, { color: palette.icon }]}>Tap to send email</ThemedText>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={16} color={palette.icon} />
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F8FAFC',
	},
	contentWrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	iconCircle: {
		width: 72,
		height: 72,
		borderRadius: 36,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#FEE2E2',
		borderWidth: 1,
		borderColor: '#FECACA',
	},
	title: {
		marginTop: 16,
		fontSize: 24,
		fontWeight: '800',
		color: '#0F172A',
		textAlign: 'center',
	},
	subtitle: {
		marginTop: 8,
		fontSize: 14,
		lineHeight: 20,
		color: '#475569',
		textAlign: 'center',
	},
	buttonRow: {
		marginTop: 20,
		width: '100%',
		flexDirection: 'row',
	},
	primaryBtn: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 10,
		backgroundColor: '#0F766E',
		alignItems: 'center',
	},
	primaryBtnText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	contactCard: {
		marginTop: 16,
		width: '100%',
		borderRadius: 12,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	contactTitle: {
		fontSize: 14,
		fontWeight: '700',
		color: '#0F172A',
		marginBottom: 4,
	},
	contactRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 8,
	},
	contactLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	contactDivider: {
		borderTopWidth: 1,
		borderTopColor: '#EEF2F7',
	},
	contactText: {
		fontSize: 13,
		color: '#334155',
		fontWeight: '600',
		textDecorationLine: 'underline',
	},
	contactHint: {
		fontSize: 11,
		color: '#64748B',
	},
});