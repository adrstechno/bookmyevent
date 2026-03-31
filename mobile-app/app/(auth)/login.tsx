import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearAuthError, loginWithCredentials, registerWithCredentials } from '@/store/slices/authSlice';

const ROLE_OPTIONS = [
	{ key: 'user', label: 'User' },
	{ key: 'vendor', label: 'Vendor' },
] as const;

type AuthMode = 'login' | 'register';
type RoleType = 'user' | 'vendor';

export default function LoginScreen() {
	const dispatch = useAppDispatch();
	const { isAuthenticated, isHydrated, isLoading, error } = useAppSelector((state) => state.auth);

	const [mode, setMode] = useState<AuthMode>('login');
	const [role, setRole] = useState<RoleType>('user');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [localError, setLocalError] = useState('');

	const subtitle = useMemo(() => {
		return mode === 'login'
			? 'Login with your dummy account to continue.'
			: 'Create a dummy account to preview role-based flows.';
	}, [mode]);

	if (isHydrated && isAuthenticated) {
		return <Redirect href="/(tabs)/home" />;
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
			await dispatch(
				loginWithCredentials({
					email: email.trim(),
					password: password.trim(),
					userType: role,
				})
			);
			return;
		}

		await dispatch(
			registerWithCredentials({
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				email: email.trim(),
				password: password.trim(),
				userType: role,
			})
		);
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
			<StatusBar style="dark" />
			<ScrollView style={styles.page} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
				<View style={styles.heroCard}>
					<ThemedText style={styles.brand}>GoEventify</ThemedText>
					<ThemedText style={styles.title}>Dummy Authentication</ThemedText>
					<ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
				</View>

				<View style={styles.formCard}>
					<View style={styles.modeRow}>
						<Pressable
							style={[styles.modeBtn, mode === 'login' ? styles.modeBtnActive : null]}
							onPress={() => switchMode('login')}
						>
							<ThemedText style={[styles.modeBtnText, mode === 'login' ? styles.modeBtnTextActive : null]}>Login</ThemedText>
						</Pressable>
						<Pressable
							style={[styles.modeBtn, mode === 'register' ? styles.modeBtnActive : null]}
							onPress={() => switchMode('register')}
						>
							<ThemedText style={[styles.modeBtnText, mode === 'register' ? styles.modeBtnTextActive : null]}>Register</ThemedText>
						</Pressable>
					</View>

					<ThemedText style={styles.label}>Choose Role</ThemedText>
					<View style={styles.roleRow}>
						{ROLE_OPTIONS.map((option) => (
							<Pressable
								key={option.key}
								style={[styles.roleBtn, role === option.key ? styles.roleBtnActive : null]}
								onPress={() => setRole(option.key)}
							>
								<ThemedText style={[styles.roleText, role === option.key ? styles.roleTextActive : null]}>
									{option.label}
								</ThemedText>
							</Pressable>
						))}
					</View>

					{mode === 'register' ? (
						<View style={styles.nameRow}>
							<TextInput
								style={[styles.input, styles.halfInput]}
								value={firstName}
								onChangeText={setFirstName}
								placeholder="First Name"
								placeholderTextColor="#94A3B8"
							/>
							<TextInput
								style={[styles.input, styles.halfInput]}
								value={lastName}
								onChangeText={setLastName}
								placeholder="Last Name"
								placeholderTextColor="#94A3B8"
							/>
						</View>
					) : null}

					<TextInput
						style={styles.input}
						value={email}
						onChangeText={setEmail}
						placeholder="Email"
						placeholderTextColor="#94A3B8"
						autoCapitalize="none"
						keyboardType="email-address"
					/>
					<TextInput
						style={styles.input}
						value={password}
						onChangeText={setPassword}
						placeholder="Password"
						placeholderTextColor="#94A3B8"
						secureTextEntry
					/>

					{localError ? <ThemedText style={styles.errorText}>{localError}</ThemedText> : null}
					{error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

					<Pressable style={[styles.submitBtn, isLoading ? styles.submitBtnDisabled : null]} onPress={onSubmit} disabled={isLoading}>
						<ThemedText style={styles.submitBtnText}>{isLoading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}</ThemedText>
					</Pressable>
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
		backgroundColor: '#0F766E',
	},
	submitBtnDisabled: {
		opacity: 0.7,
	},
	submitBtnText: {
		color: '#FFFFFF',
		fontSize: 15,
		fontWeight: '800',
	},
});
