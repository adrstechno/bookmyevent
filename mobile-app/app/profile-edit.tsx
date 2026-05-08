import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	BackHandler,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTopBar } from '@/components/layout/AppTopBar';
import { ThemedText } from '@/components/themed-text';
import { changePassword } from '@/services/auth/authApi';
import { getUserProfile, updateUserProfile } from '@/services/auth/profileApi';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateProfile } from '@/store/slices/authSlice';
import { useSettingsTheme } from '@/theme/settingsTheme';

// ─── Types ───────────────────────────────────────────────────

type ProfileForm = {
	firstName: string;
	lastName: string;
	phone: string;
};

type PasswordForm = {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
};

type FeedbackState = {
	message: string;
	type: 'success' | 'error';
} | null;

// ─── Helpers ─────────────────────────────────────────────────

const isValidPhone = (v: string) => v.replace(/\D/g, '').length === 10;

// ─── Component ───────────────────────────────────────────────

export default function ProfileEditScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const dispatch = useAppDispatch();
	const { isAuthenticated, isHydrated, name: authName, email: authEmail } = useAppSelector((s) => s.auth);
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';

	// ── State ──
	const [profileForm, setProfileForm] = useState<ProfileForm>({
		firstName: (authName || 'Guest').split(' ')[0] ?? 'Guest',
		lastName: (authName || '').split(' ').slice(1).join(' '),
		phone: '',
	});
	const [displayEmail, setDisplayEmail] = useState(authEmail ?? '');
	const [passwordForm, setPasswordForm] = useState<PasswordForm>({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	const [isLoadingProfile, setIsLoadingProfile] = useState(true);
	const [isEditMode, setIsEditMode] = useState(false);
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [profileFeedback, setProfileFeedback] = useState<FeedbackState>(null);
	const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState>(null);

	// ── Navigation ──
	const goBack = useCallback(() => {
		router.replace('/(tabs)/profile');
	}, [router]);

	useEffect(() => {
		const sub = BackHandler.addEventListener('hardwareBackPress', () => {
			goBack();
			return true;
		});
		return () => sub.remove();
	}, [goBack]);

	// ── Load profile ──
	useEffect(() => {
		if (!isAuthenticated) return;

		let cancelled = false;

		const load = async () => {
			setIsLoadingProfile(true);
			try {
				const profile = await getUserProfile();
				if (!cancelled) {
					setProfileForm({
						firstName: profile.first_name || '',
						lastName: profile.last_name || '',
						phone: profile.phone || '',
					});
					setDisplayEmail(profile.email || '');
				}
			} catch {
				if (!cancelled) {
					// Fallback to Redux store data silently
					setProfileForm({
						firstName: (authName || 'Guest').split(' ')[0] ?? 'Guest',
						lastName: (authName || '').split(' ').slice(1).join(' '),
						phone: '',
					});
					setDisplayEmail(authEmail ?? '');
				}
			} finally {
				if (!cancelled) setIsLoadingProfile(false);
			}
		};

		void load();
		return () => { cancelled = true; };
	}, [isAuthenticated, authName, authEmail]);

	// ── Save profile ──
	const onSaveProfile = useCallback(async () => {
		const payload = {
			first_name: profileForm.firstName.trim(),
			last_name: profileForm.lastName.trim(),
			phone: profileForm.phone.trim(),
		};

		if (!payload.first_name || !payload.last_name || !payload.phone) {
			setProfileFeedback({ message: 'Please fill all fields.', type: 'error' });
			return;
		}
		if (!isValidPhone(payload.phone)) {
			setProfileFeedback({ message: 'Please enter a valid 10-digit phone number.', type: 'error' });
			return;
		}

		setIsSavingProfile(true);
		setProfileFeedback(null);

		try {
			const updated = await updateUserProfile(payload);
			dispatch(updateProfile({
				name: `${updated.first_name} ${updated.last_name}`.trim(),
				email: updated.email,
			}));
			setProfileForm({
				firstName: updated.first_name || '',
				lastName: updated.last_name || '',
				phone: updated.phone || '',
			});
			setDisplayEmail(updated.email || '');
			setProfileFeedback({ message: 'Profile updated successfully.', type: 'success' });
			setIsEditMode(false);
			setTimeout(() => setProfileFeedback(null), 3000);
		} catch (err: unknown) {
			const e = err as { message?: string };
			setProfileFeedback({ message: e?.message || 'Failed to update profile. Please try again.', type: 'error' });
		} finally {
			setIsSavingProfile(false);
		}
	}, [profileForm, dispatch]);

	// ── Change password ──
	const onChangePassword = useCallback(async () => {
		const { currentPassword, newPassword, confirmPassword } = passwordForm;

		if (!currentPassword || !newPassword || !confirmPassword) {
			setPasswordFeedback({ message: 'Please fill all password fields.', type: 'error' });
			return;
		}
		if (newPassword.length < 6) {
			setPasswordFeedback({ message: 'New password must be at least 6 characters.', type: 'error' });
			return;
		}
		if (newPassword !== confirmPassword) {
			setPasswordFeedback({ message: 'Passwords do not match.', type: 'error' });
			return;
		}

		setIsChangingPassword(true);
		setPasswordFeedback(null);

		try {
			const msg = await changePassword({ email: authEmail ?? '', oldPassword: currentPassword, newPassword });
			setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
			setPasswordFeedback({ message: msg || 'Password changed successfully.', type: 'success' });
			setTimeout(() => setPasswordFeedback(null), 3000);
		} catch (err: unknown) {
			const e = err as { message?: string };
			setPasswordFeedback({ message: e?.message || 'Failed to change password. Please try again.', type: 'error' });
		} finally {
			setIsChangingPassword(false);
		}
	}, [passwordForm]);

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<SafeAreaView style={[styles.safe, { backgroundColor: palette.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<AppTopBar title="Edit Profile" onBackPress={goBack} />

			<ScrollView
				style={styles.page}
				contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				{/* ── Profile Card ── */}
				<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					{/* Card header */}
					<View style={[styles.cardHeader, { borderBottomColor: palette.border }]}>
						<View style={[styles.cardIconWrap, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' }]}>
							<Ionicons name="person-outline" size={16} color={palette.primary} />
						</View>
						<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Profile Information</ThemedText>
						{!isLoadingProfile && !isEditMode && (
							<Pressable
								style={[styles.editChip, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' }]}
								onPress={() => { setProfileFeedback(null); setIsEditMode(true); }}
							>
								<Ionicons name="pencil-outline" size={13} color={palette.primary} />
								<ThemedText style={[styles.editChipText, { color: palette.primary }]}>Edit</ThemedText>
							</Pressable>
						)}
					</View>

					{/* Loading */}
					{isLoadingProfile ? (
						<View style={styles.loadingWrap}>
							<ActivityIndicator size="small" color={palette.primary} />
							<ThemedText style={[styles.loadingText, { color: palette.subtext }]}>Loading profile...</ThemedText>
						</View>
					) : isEditMode ? (
						/* ── Edit Mode ── */
						<View style={styles.formBody}>
							<FormField
								label="First Name"
								value={profileForm.firstName}
								onChangeText={(v) => setProfileForm((p) => ({ ...p, firstName: v }))}
								placeholder="First Name"
								autoCapitalize="words"
								palette={palette}
							/>
							<FormField
								label="Last Name"
								value={profileForm.lastName}
								onChangeText={(v) => setProfileForm((p) => ({ ...p, lastName: v }))}
								placeholder="Last Name"
								autoCapitalize="words"
								palette={palette}
							/>
							<FormField
								label="Email"
								value={displayEmail}
								onChangeText={() => {}}
								placeholder="Email address"
								keyboardType="email-address"
								autoCapitalize="none"
								editable={false}
								palette={palette}
							/>
							<FormField
								label="Phone"
								value={profileForm.phone}
								onChangeText={(v) => setProfileForm((p) => ({ ...p, phone: v }))}
								placeholder="10-digit phone number"
								keyboardType="phone-pad"
								maxLength={10}
								palette={palette}
							/>

							{profileFeedback && (
								<Feedback message={profileFeedback.message} type={profileFeedback.type} />
							)}

							<View style={styles.btnRow}>
								<Pressable
									style={({ pressed }) => [
										styles.btnSecondary,
										{ borderColor: palette.border, backgroundColor: palette.elevatedBg },
										pressed && styles.btnPressed,
									]}
									onPress={() => { setIsEditMode(false); setProfileFeedback(null); }}
								>
									<ThemedText style={[styles.btnSecondaryText, { color: palette.subtext }]}>Cancel</ThemedText>
								</Pressable>
								<Pressable
									style={({ pressed }) => [
										styles.btnPrimary,
										{ backgroundColor: palette.primary },
										isSavingProfile && styles.btnDisabled,
										pressed && styles.btnPressed,
									]}
									onPress={() => void onSaveProfile()}
									disabled={isSavingProfile}
								>
									{isSavingProfile
										? <ActivityIndicator size="small" color="#FFFFFF" />
										: <ThemedText style={styles.btnPrimaryText}>Save Changes</ThemedText>
									}
								</Pressable>
							</View>
						</View>
					) : (
						/* ── View Mode ── */
						<View style={styles.viewBody}>
							<ProfileRow label="First Name" value={profileForm.firstName} palette={palette} />
							<ProfileRow label="Last Name" value={profileForm.lastName} palette={palette} />
							<ProfileRow label="Email" value={displayEmail} palette={palette} />
							<ProfileRow label="Phone" value={profileForm.phone} palette={palette} isLast />

							{profileFeedback && (
								<Feedback message={profileFeedback.message} type={profileFeedback.type} />
							)}
						</View>
					)}
				</View>

				{/* ── Change Password Card ── */}
				<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<View style={[styles.cardHeader, { borderBottomColor: palette.border }]}>
						<View style={[styles.cardIconWrap, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' }]}>
							<Ionicons name="lock-closed-outline" size={16} color={palette.primary} />
						</View>
						<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Change Password</ThemedText>
					</View>

					<View style={styles.formBody}>
						<FormField
							label="Current Password"
							value={passwordForm.currentPassword}
							onChangeText={(v) => setPasswordForm((p) => ({ ...p, currentPassword: v }))}
							placeholder="Enter current password"
							secureTextEntry
							palette={palette}
						/>
						<FormField
							label="New Password"
							value={passwordForm.newPassword}
							onChangeText={(v) => setPasswordForm((p) => ({ ...p, newPassword: v }))}
							placeholder="Min. 6 characters"
							secureTextEntry
							palette={palette}
						/>
						<FormField
							label="Confirm New Password"
							value={passwordForm.confirmPassword}
							onChangeText={(v) => setPasswordForm((p) => ({ ...p, confirmPassword: v }))}
							placeholder="Re-enter new password"
							secureTextEntry
							palette={palette}
						/>

						{passwordFeedback && (
							<Feedback message={passwordFeedback.message} type={passwordFeedback.type} />
						)}

						<Pressable
							style={({ pressed }) => [
								styles.btnFull,
								{ backgroundColor: palette.primary },
								isChangingPassword && styles.btnDisabled,
								pressed && styles.btnPressed,
							]}
							onPress={() => void onChangePassword()}
							disabled={isChangingPassword}
						>
							{isChangingPassword
								? <ActivityIndicator size="small" color="#FFFFFF" />
								: <ThemedText style={styles.btnPrimaryText}>Update Password</ThemedText>
							}
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

// ─── Sub-components ──────────────────────────────────────────

function FormField({
	label,
	value,
	onChangeText,
	placeholder,
	secureTextEntry,
	keyboardType,
	autoCapitalize,
	maxLength,
	editable = true,
	palette,
}: {
	label: string;
	value: string;
	onChangeText: (v: string) => void;
	placeholder?: string;
	secureTextEntry?: boolean;
	keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
	autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
	maxLength?: number;
	editable?: boolean;
	palette: any;
}) {
	return (
		<View style={styles.fieldWrap}>
			<ThemedText style={[styles.fieldLabel, { color: palette.subtext }]}>{label}</ThemedText>
			<TextInput
				style={[
					styles.input,
					{ backgroundColor: palette.screenBg, borderColor: palette.border, color: palette.text },
					!editable && { opacity: 0.5 },
				]}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={palette.subtext}
				secureTextEntry={secureTextEntry}
				keyboardType={keyboardType}
				autoCapitalize={autoCapitalize ?? 'none'}
				maxLength={maxLength}
				editable={editable}
			/>
		</View>
	);
}

function ProfileRow({
	label,
	value,
	palette,
	isLast,
}: {
	label: string;
	value: string;
	palette: any;
	isLast?: boolean;
}) {
	return (
		<View style={[styles.profileRow, !isLast && { borderBottomWidth: 1, borderBottomColor: palette.border }]}>
			<ThemedText style={[styles.profileRowLabel, { color: palette.subtext }]}>{label}</ThemedText>
			<ThemedText style={[styles.profileRowValue, { color: palette.text }]}>{value || '—'}</ThemedText>
		</View>
	);
}

function Feedback({ message, type }: { message: string; type: 'success' | 'error' }) {
	return (
		<View style={[styles.feedbackWrap, { backgroundColor: type === 'success' ? '#F0FDF4' : '#FEF2F2', borderColor: type === 'success' ? '#BBF7D0' : '#FECACA' }]}>
			<Ionicons
				name={type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
				size={15}
				color={type === 'success' ? '#16A34A' : '#DC2626'}
			/>
			<ThemedText style={[styles.feedbackText, { color: type === 'success' ? '#166534' : '#991B1B' }]}>
				{message}
			</ThemedText>
		</View>
	);
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
	safe: { flex: 1 },
	page: { flex: 1 },
	scroll: {
		paddingHorizontal: 16,
		paddingTop: 16,
		gap: 14,
	},

	// Card
	card: {
		borderRadius: 14,
		borderWidth: 1,
		overflow: 'hidden',
		marginBottom: 14,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingHorizontal: 14,
		paddingVertical: 14,
		borderBottomWidth: 1,
	},
	cardIconWrap: {
		width: 30,
		height: 30,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cardTitle: {
		flex: 1,
		fontSize: 15,
		fontWeight: '800',
	},
	editChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
	},
	editChipText: {
		fontSize: 12,
		fontWeight: '700',
	},

	// Loading
	loadingWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		padding: 20,
	},
	loadingText: {
		fontSize: 13,
		fontWeight: '500',
	},

	// View mode rows
	viewBody: {
		paddingHorizontal: 14,
		paddingVertical: 4,
	},
	profileRow: {
		paddingVertical: 13,
		gap: 3,
	},
	profileRowLabel: {
		fontSize: 11,
		fontWeight: '600',
		textTransform: 'uppercase',
		letterSpacing: 0.4,
	},
	profileRowValue: {
		fontSize: 15,
		fontWeight: '500',
	},

	// Form
	formBody: {
		padding: 14,
		gap: 12,
	},
	fieldWrap: {
		gap: 6,
	},
	fieldLabel: {
		fontSize: 12,
		fontWeight: '700',
	},
	input: {
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 13,
		paddingVertical: 12,
		fontSize: 14,
	},

	// Feedback
	feedbackWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 9,
	},
	feedbackText: {
		flex: 1,
		fontSize: 13,
		fontWeight: '600',
		lineHeight: 18,
	},

	// Buttons
	btnRow: {
		flexDirection: 'row',
		gap: 10,
		marginTop: 4,
	},
	btnPrimary: {
		flex: 1,
		paddingVertical: 13,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 46,
	},
	btnPrimaryText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	btnSecondary: {
		flex: 1,
		paddingVertical: 13,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 46,
	},
	btnSecondaryText: {
		fontSize: 14,
		fontWeight: '700',
	},
	btnFull: {
		paddingVertical: 13,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 46,
		marginTop: 4,
	},
	btnDisabled: {
		opacity: 0.6,
	},
	btnPressed: {
		opacity: 0.85,
		transform: [{ scale: 0.98 }],
	},
});
