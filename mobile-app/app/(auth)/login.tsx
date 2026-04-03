import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearAuthError, loginWithCredentials, registerWithCredentials } from '@/store/slices/authSlice';
import { useAppTheme } from '@/theme/useAppTheme';
import { getRoleHomeRoute } from '@/utils/authRole';

const ROLE_OPTIONS = [
	{ key: 'user', label: 'User' },
	{ key: 'vendor', label: 'Vendor' },
	{ key: 'admin', label: 'Admin' },
] as const;

type AuthMode = 'login' | 'register';
type RoleType = 'user' | 'vendor' | 'admin';

export default function LoginScreen() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { showError, showSuccess } = useAppToast();
	const { isAuthenticated, isHydrated, isLoading, error, role: authRole } = useAppSelector((state) => state.auth);
	const { palette, resolvedMode } = useAppTheme();
	const isDark = resolvedMode === 'dark';
	const screenBg = palette.screenBg;
	const surfaceBg = palette.surfaceBg;
	const border = palette.border;
	const softBg = palette.elevatedBg;

	const [mode, setMode] = useState<AuthMode>('login');
	const [role, setRole] = useState<RoleType>('user');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [localError, setLocalError] = useState('');

	const subtitle = useMemo(() => {
		return mode === 'login'
			? 'Sign in to continue your event workflows.'
			: 'Create your account to start with role-based access.';
	}, [mode]);

	const demoEmail = useMemo(() => {
		if (role === 'admin') {
			return 'admin@test.com';
		}

		if (role === 'vendor') {
			return 'vendor@test.com';
		}

		return 'user@test.com';
	}, [role]);

	if (isHydrated && isAuthenticated) {
		return <Redirect href={getRoleHomeRoute(authRole)} />;
	}

	const switchMode = (nextMode: AuthMode) => {
		setMode(nextMode);
		setLocalError('');
		dispatch(clearAuthError());
	};

	const validate = () => {
		if (mode === 'register' && (!firstName.trim() || !lastName.trim())) {
			setLocalError('First name and last name are required.');
			return false;
		}

		if (!email.trim()) {
			setLocalError('Email is required.');
			return false;
		}

		if (!password.trim()) {
			setLocalError('Password is required.');
			return false;
		}

		if (password.trim().length < 4) {
			setLocalError('Password must be at least 4 characters.');
			return false;
		}

		return true;
	};

	const onSubmit = async () => {
		setLocalError('');
		dispatch(clearAuthError());

		if (!validate()) {
			return;
		}

		if (mode === 'login') {
			try {
				await dispatch(
					loginWithCredentials({
						email: email.trim(),
						password: password.trim(),
						userType: role,
					})
				).unwrap();
				showSuccess('Login successful.');
			} catch (err) {
				if (typeof err === 'string') {
					showError(err);
				} else {
					showError('Login failed. Please try again.');
				}
			}
			return;
		}

		try {
			await dispatch(
				registerWithCredentials({
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					email: email.trim(),
					password: password.trim(),
					userType: role,
				})
			).unwrap();
			showSuccess('Sign Up successful.');
		} catch (err) {
			if (typeof err === 'string') {
				showError(err);
			} else {
				showError('Sign Up failed. Please try again.');
			}
		}
	};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<ScrollView style={[styles.page, { backgroundColor: screenBg }]} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
				<View style={[styles.heroCard, { backgroundColor: surfaceBg, borderColor: border, borderTopColor: palette.primary }]}>
					<ThemedText style={[styles.brand, { color: palette.primary }]}>GoEventify</ThemedText>
					<ThemedText style={[styles.title, { color: palette.text }]}>Welcome Back</ThemedText>
					<ThemedText style={[styles.subtitle, { color: palette.subtext }]}>{subtitle}</ThemedText>
					<ThemedText style={[styles.demoHint, { color: palette.accent }]}>Demo: {demoEmail} / 123456</ThemedText>
				</View>

				<View style={[styles.formCard, { backgroundColor: surfaceBg, borderColor: border }]}>
					<View style={[styles.modeRow, { backgroundColor: softBg }]}> 
						<Pressable
							style={[styles.modeBtn, mode === 'login' ? [styles.modeBtnActive, { backgroundColor: surfaceBg }] : null]}
							onPress={() => switchMode('login')}
						>
							<ThemedText style={[styles.modeBtnText, { color: palette.subtext }, mode === 'login' ? [styles.modeBtnTextActive, { color: palette.text }] : null]}>Login</ThemedText>
						</Pressable>
						<Pressable
							style={[styles.modeBtn, mode === 'register' ? [styles.modeBtnActive, { backgroundColor: surfaceBg }] : null]}
							onPress={() => switchMode('register')}
						>
							<ThemedText style={[styles.modeBtnText, { color: palette.subtext }, mode === 'register' ? [styles.modeBtnTextActive, { color: palette.text }] : null]}>Register</ThemedText>
						</Pressable>
					</View>

					<ThemedText style={[styles.label, { color: palette.subtext }]}>Choose Role</ThemedText>
					<View style={styles.roleRow}>
						{ROLE_OPTIONS.map((option) => (
							<Pressable
								key={option.key}
								style={[
									styles.roleBtn,
									{ backgroundColor: softBg, borderColor: border },
									role === option.key ? [styles.roleBtnActive, { backgroundColor: palette.pressedBg, borderColor: palette.primary }] : null,
								]}
								onPress={() => setRole(option.key)}
							>
								<ThemedText style={[styles.roleText, { color: palette.subtext }, role === option.key ? [styles.roleTextActive, { color: palette.primary }] : null]}>
									{option.label}
								</ThemedText>
							</Pressable>
						))}
					</View>

					{mode === 'register' ? (
						<View style={styles.nameRow}>
							<TextInput
								style={[styles.input, styles.halfInput, { backgroundColor: surfaceBg, borderColor: border, color: palette.text }]}
								value={firstName}
								onChangeText={setFirstName}
								placeholder="First Name"
								placeholderTextColor={palette.muted}
							/>
							<TextInput
								style={[styles.input, styles.halfInput, { backgroundColor: surfaceBg, borderColor: border, color: palette.text }]}
								value={lastName}
								onChangeText={setLastName}
								placeholder="Last Name"
								placeholderTextColor={palette.muted}
							/>
						</View>
					) : null}

					<TextInput
						style={[styles.input, { backgroundColor: surfaceBg, borderColor: border, color: palette.text }]}
						value={email}
						onChangeText={setEmail}
						placeholder="Email"
						placeholderTextColor={palette.muted}
						autoCapitalize="none"
						keyboardType="email-address"
					/>
					<TextInput
						style={[styles.input, { backgroundColor: surfaceBg, borderColor: border, color: palette.text }]}
						value={password}
						onChangeText={setPassword}
						placeholder="Password"
						placeholderTextColor={palette.muted}
						secureTextEntry
					/>

					{mode === 'login' ? (
						<Pressable style={styles.inlineLinkBtn} onPress={() => router.push('/(auth)/forgot-password')}>
							<ThemedText style={[styles.inlineLinkText, { color: palette.primary }]}>Forgot password?</ThemedText>
						</Pressable>
					) : null}

					{localError ? <ThemedText style={[styles.errorText, { color: palette.danger }]}>{localError}</ThemedText> : null}
					{error ? <ThemedText style={[styles.errorText, { color: palette.danger }]}>{error}</ThemedText> : null}

					<Pressable style={[styles.submitBtn, { backgroundColor: palette.primary }, isLoading ? styles.submitBtnDisabled : null]} onPress={onSubmit} disabled={isLoading}>
						<ThemedText style={[styles.submitBtnText, { color: palette.onPrimary }]}>{isLoading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}</ThemedText>
					</Pressable>

					{mode === 'login' ? (
						<Pressable style={styles.footerSwitchBtn} onPress={() => switchMode('register')}>
							<ThemedText style={[styles.footerSwitchText, { color: palette.primary }]}>Don&apos;t have an account? Register</ThemedText>
						</Pressable>
					) : null}
				</View>

			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#EEF4F3',
	},
	page: {
		flex: 1,
	},
	container: {
		padding: 16,
		gap: 12,
		paddingBottom: 28,
	},
	heroCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		padding: 16,
		gap: 4,
		borderTopWidth: 4,
		borderTopColor: '#3C6E71',
		borderWidth: 1,
		borderColor: '#DCE5E8',
	},
	brand: {
		fontSize: 12,
		fontWeight: '700',
		color: '#0F766E',
		letterSpacing: 0.4,
	},
	title: {
		fontSize: 24,
		lineHeight: 28,
		fontWeight: '800',
		color: '#0F172A',
	},
	subtitle: {
		fontSize: 13,
		color: '#64748B',
	},
	demoHint: {
		marginTop: 4,
		fontSize: 12,
		fontWeight: '700',
		color: '#0F766E',
	},
	formCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 18,
		padding: 14,
		gap: 10,
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	modeRow: {
		flexDirection: 'row',
		backgroundColor: '#F1F5F9',
		borderRadius: 12,
		padding: 4,
		gap: 4,
	},
	modeBtn: {
		flex: 1,
		paddingVertical: 9,
		borderRadius: 9,
		alignItems: 'center',
	},
	modeBtnActive: {
		backgroundColor: '#FFFFFF',
	},
	modeBtnText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#64748B',
	},
	modeBtnTextActive: {
		color: '#0F172A',
	},
	label: {
		fontSize: 13,
		fontWeight: '700',
		color: '#475569',
	},
	roleRow: {
		flexDirection: 'row',
		gap: 8,
	},
	roleBtn: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: 'center',
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#D0DCE3',
	},
	roleBtnActive: {
		backgroundColor: '#ECFEFF',
		borderColor: '#0F766E',
	},
	roleText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#475569',
	},
	roleTextActive: {
		color: '#0F766E',
	},
	nameRow: {
		flexDirection: 'row',
		gap: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: '#CBD5E1',
		borderRadius: 11,
		paddingHorizontal: 12,
		paddingVertical: 11,
		fontSize: 15,
		color: '#1F2937',
		backgroundColor: '#FFFFFF',
	},
	inlineLinkBtn: {
		alignSelf: 'flex-end',
	},
	inlineLinkText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#0F766E',
	},
	halfInput: {
		flex: 1,
	},
	errorText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#DC2626',
	},
	submitBtn: {
		marginTop: 4,
		paddingVertical: 13,
		borderRadius: 11,
		alignItems: 'center',
		backgroundColor: '#3C6E71',
	},
	submitBtnDisabled: {
		opacity: 0.55,
	},
	submitBtnText: {
		color: '#FFFFFF',
		fontSize: 15,
		fontWeight: '700',
	},
	footerSwitchBtn: {
		paddingTop: 8,
		alignItems: 'center',
	},
	footerSwitchText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#0F766E',
	},
});
