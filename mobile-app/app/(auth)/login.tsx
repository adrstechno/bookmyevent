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
] as const;

type AuthMode = 'login' | 'register';
type RoleType = 'user' | 'vendor';

export default function LoginScreen() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { showError, showSuccess } = useAppToast();
	const { isAuthenticated, isHydrated, isLoading, error, role: authRole } = useAppSelector((state) => state.auth);
	const { palette, resolvedMode } = useAppTheme();
	const isDark = resolvedMode === 'dark';

	const [mode, setMode] = useState<AuthMode>('login');
	const [role, setRole] = useState<RoleType>('user');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [localError, setLocalError] = useState('');

	const subtitle = useMemo(() => {
		return mode === 'login'
			? 'Sign in with your account and continue where you left off.'
			: 'Create your account to start booking services with GoEventify.';
	}, [mode]);

	if (isHydrated && isAuthenticated) {
		return <Redirect href={getRoleHomeRoute(authRole)} />;
	}

	const switchMode = (nextMode: AuthMode) => {
		setMode(nextMode);
		setLocalError('');
		setFirstName('');
		setLastName('');
		setPhone('');
		setEmail('');
		setPassword('');
		dispatch(clearAuthError());
	};

	const validate = () => {
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

		if (mode === 'register') {
			if (!phone.trim()) {
				setLocalError('Phone number is required.');
				return false;
			}
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
						email: email.trim().toLowerCase(),
						password: password.trim(),
					})
				).unwrap();
				showSuccess('Login successful!');
			} catch (err) {
				const message = typeof err === 'string' ? err : 'Login failed. Please try again.';
				showError(message);
			}
			return;
		}

		// Register mode
		try {
			const registerResult = await dispatch(
				registerWithCredentials({
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					email: email.trim().toLowerCase(),
					password: password.trim(),
					phone: phone.trim(),
					userType: role,
				})
			).unwrap();
			showSuccess(registerResult.message ?? 'Registration successful. Please sign in.');
			setMode('login');
			setPassword('');
			setLocalError('');
		} catch (err) {
			const message = typeof err === 'string' ? err : 'Registration failed. Please try again.';
			showError(message);
		}
	};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<ScrollView
				style={[styles.page, { backgroundColor: palette.screenBg }]}
				contentContainerStyle={styles.container}
				showsVerticalScrollIndicator={false}
			>
				{/* Header Section */}
				<View style={styles.headerSection}>
					<View style={styles.logoPill}>
						<ThemedText style={[styles.logoPillText, { color: palette.primary }]}>GOEVENTIFY</ThemedText>
					</View>
					<ThemedText style={[styles.brand, { color: palette.text }]}>GoEventify</ThemedText>
					<ThemedText style={[styles.title, { color: palette.text }]}>
						{mode === 'login' ? 'Welcome Back' : 'Join Us'}
					</ThemedText>
					<ThemedText style={[styles.subtitle, { color: palette.subtext }]}>{subtitle}</ThemedText>
				</View>

				{/* Auth Mode Tabs */}
				<View style={[styles.modeTabs, { backgroundColor: palette.elevatedBg }]}>
					<Pressable
						style={[
							styles.modeTab,
							mode === 'login' && [styles.modeTabActive, { backgroundColor: palette.primary }],
						]}
						onPress={() => switchMode('login')}
					>
						<ThemedText
							style={[
								styles.modeTabText,
								mode === 'login'
									? { color: palette.onPrimary, fontWeight: '700' }
									: { color: palette.subtext },
							]}
						>
							Login
						</ThemedText>
					</Pressable>
					<Pressable
						style={[
							styles.modeTab,
							mode === 'register' && [styles.modeTabActive, { backgroundColor: palette.primary }],
						]}
						onPress={() => switchMode('register')}
					>
						<ThemedText
							style={[
								styles.modeTabText,
								mode === 'register'
									? { color: palette.onPrimary, fontWeight: '700' }
									: { color: palette.subtext },
							]}
						>
							Register
						</ThemedText>
					</Pressable>
				</View>

				{/* Form Fields */}
				<View style={[styles.section, styles.formPanel, { borderColor: palette.border, backgroundColor: palette.surfaceBg }]}>
					{mode === 'register' && (
						<>
							<ThemedText style={[styles.label, { color: palette.text }]}>Select Role</ThemedText>
							<View style={styles.roleGrid}>
								{ROLE_OPTIONS.map((option) => (
									<Pressable
										key={option.key}
										style={[
											styles.roleButton,
											{
												backgroundColor: palette.elevatedBg,
												borderColor: role === option.key ? palette.primary : palette.border,
											},
											role === option.key && { borderWidth: 2 },
										]}
										onPress={() => setRole(option.key)}
									>
										<ThemedText
											style={[
												styles.roleButtonText,
												{ color: role === option.key ? palette.primary : palette.subtext },
											]}
										>
											{option.label}
										</ThemedText>
									</Pressable>
								))}
							</View>
						</>
					)}
					{/* Name Fields (Register only) */}
					{mode === 'register' && (
						<View style={styles.nameRow}>
							<TextInput
								style={[
									styles.inputHalf,
									{
										backgroundColor: palette.elevatedBg,
										borderColor: palette.border,
										color: palette.text,
									},
								]}
								value={firstName}
								onChangeText={setFirstName}
								placeholder="First Name (optional)"
								placeholderTextColor={palette.muted}
							/>
							<TextInput
								style={[
									styles.inputHalf,
									{
										backgroundColor: palette.elevatedBg,
										borderColor: palette.border,
										color: palette.text,
									},
								]}
								value={lastName}
								onChangeText={setLastName}
								placeholder="Last Name (optional)"
								placeholderTextColor={palette.muted}
							/>
						</View>
					)}

					{/* Email Input */}
					<TextInput
						style={[
							styles.input,
							{
								backgroundColor: palette.elevatedBg,
								borderColor: palette.border,
								color: palette.text,
							},
						]}
						value={email}
						onChangeText={setEmail}
						placeholder="Email"
						placeholderTextColor={palette.muted}
						autoCapitalize="none"
						keyboardType="email-address"
						editable={!isLoading}
					/>

					{/* Phone Input (Register only) */}
					{mode === 'register' && (
						<TextInput
							style={[
								styles.input,
								{
									backgroundColor: palette.elevatedBg,
									borderColor: palette.border,
									color: palette.text,
								},
							]}
							value={phone}
							onChangeText={setPhone}
							placeholder="Phone Number"
							placeholderTextColor={palette.muted}
							keyboardType="phone-pad"
							editable={!isLoading}
						/>
					)}

					{/* Password Input */}
					<TextInput
						style={[
							styles.input,
							{
								backgroundColor: palette.elevatedBg,
								borderColor: palette.border,
								color: palette.text,
							},
						]}
						value={password}
						onChangeText={setPassword}
						placeholder="Password"
						placeholderTextColor={palette.muted}
						secureTextEntry
						editable={!isLoading}
					/>

					{/* Forgot Password Link (Login only) */}
					{mode === 'login' && (
						<Pressable
							style={styles.forgotPasswordBtn}
							onPress={() => router.push('/(auth)/forgot-password')}
							disabled={isLoading}
						>
							<ThemedText style={[styles.forgotPasswordText, { color: palette.primary }]}>
								Forgot password?
							</ThemedText>
						</Pressable>
					)}

					{/* Error Messages */}
					{localError && (
						<ThemedText style={[styles.errorMessage, { color: palette.danger }]}>{localError}</ThemedText>
					)}
					{error && <ThemedText style={[styles.errorMessage, { color: palette.danger }]}>{error}</ThemedText>}

					{/* Submit Button */}
					<Pressable
						style={[
							styles.submitButton,
							{ backgroundColor: palette.primary },
							isLoading && styles.submitButtonDisabled,
						]}
						onPress={onSubmit}
						disabled={isLoading}
					>
						<ThemedText style={[styles.submitButtonText, { color: palette.onPrimary }]}>
							{isLoading ? '...' : mode === 'login' ? 'Login' : 'Create Account'}
						</ThemedText>
					</Pressable>

					{/* Mode Switch Footer */}
					{mode === 'login' ? (
						<View style={styles.footerRow}>
							<ThemedText style={[styles.footerText, { color: palette.subtext }]}>
								Don&apos;t have an account?{' '}
							</ThemedText>
							<Pressable onPress={() => switchMode('register')} disabled={isLoading}>
								<ThemedText style={[styles.footerLink, { color: palette.primary }]}>Register</ThemedText>
							</Pressable>
						</View>
					) : (
						<View style={styles.footerRow}>
							<ThemedText style={[styles.footerText, { color: palette.subtext }]}>
								Already have an account?{' '}
							</ThemedText>
							<Pressable onPress={() => switchMode('login')} disabled={isLoading}>
								<ThemedText style={[styles.footerLink, { color: palette.primary }]}>Login</ThemedText>
							</Pressable>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	page: {
		flex: 1,
	},
	container: {
		padding: 20,
		gap: 20,
		paddingBottom: 36,
	},
	headerSection: {
		gap: 6,
		marginBottom: 4,
	},
	logoPill: {
		alignSelf: 'flex-start',
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
		backgroundColor: '#FDE7EF',
	},
	logoPillText: {
		fontSize: 11,
		letterSpacing: 1,
		fontWeight: '800',
	},
	brand: {
		fontSize: 20,
		fontWeight: '900',
		letterSpacing: 0.2,
	},
	title: {
		fontSize: 30,
		fontWeight: '800',
		lineHeight: 34,
	},
	subtitle: {
		fontSize: 14,
		lineHeight: 21,
	},
	modeTabs: {
		flexDirection: 'row',
		gap: 8,
		padding: 4,
		borderRadius: 12,
	},
	modeTab: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modeTabActive: {},
	modeTabText: {
		fontSize: 14,
		fontWeight: '600',
	},
	section: {
		gap: 14,
	},
	formPanel: {
		borderWidth: 1,
		borderRadius: 16,
		padding: 14,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
	},
	roleGrid: {
		flexDirection: 'row',
		gap: 12,
	},
	roleButton: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderRadius: 10,
		alignItems: 'center',
		borderWidth: 1,
	},
	roleButtonText: {
		fontSize: 13,
		fontWeight: '600',
		textAlign: 'center',
	},
	nameRow: {
		flexDirection: 'row',
		gap: 12,
	},
	inputHalf: {
		flex: 1,
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 14,
		paddingVertical: 13,
		minHeight: 48,
		fontSize: 15,
	},
	input: {
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 14,
		paddingVertical: 13,
		minHeight: 48,
		fontSize: 15,
	},
	forgotPasswordBtn: {
		alignSelf: 'flex-end',
	},
	forgotPasswordText: {
		fontSize: 13,
		fontWeight: '600',
	},
	errorMessage: {
		fontSize: 12,
		fontWeight: '500',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 6,
	},
	submitButton: {
		paddingVertical: 14,
		borderRadius: 10,
		alignItems: 'center',
		marginVertical: 8,
	},
	submitButtonDisabled: {
		opacity: 0.6,
	},
	submitButtonText: {
		fontSize: 15,
		fontWeight: '700',
	},
	footerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 8,
	},
	footerText: {
		fontSize: 13,
	},
	footerLink: {
		fontSize: 13,
		fontWeight: '700',
	},
});
