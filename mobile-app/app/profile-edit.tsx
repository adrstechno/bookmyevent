import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAppSelector } from '@/store';

type EditProfileForm = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	city: string;
};

export default function ProfileEditScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
	const { height: screenHeight } = useWindowDimensions();
	const params = useLocalSearchParams<EditProfileForm>();
	const [form, setForm] = useState<EditProfileForm>({
		firstName: params.firstName ?? 'Nayan',
		lastName: params.lastName ?? 'Malviya',
		email: params.email ?? 'nayan@example.com',
		phone: params.phone ?? '+91 98765 43210',
		city: params.city ?? 'Indore',
	});
	const [message, setMessage] = useState('');
	const headerAnim = useRef(new Animated.Value(0)).current;
	const cardAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(headerAnim, {
				toValue: 1,
				duration: 280,
				useNativeDriver: true,
			}),
			Animated.timing(cardAnim, {
				toValue: 1,
				duration: 420,
				delay: 90,
				useNativeDriver: true,
			}),
		]).start();
	}, [cardAnim, headerAnim]);

	useEffect(() => {
		const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
			router.replace('/(tabs)/profile');
			return true;
		});

		return () => subscription.remove();
	}, [router]);

	const goBack = () => {
		router.replace('/(tabs)/profile');
	};

	const onSave = () => {
		setMessage('Profile changes saved locally (demo mode).');
	};

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
			<StatusBar style="dark" />
			<Animated.View
				style={[
					styles.header,
					{
						opacity: headerAnim,
						transform: [
							{
								translateY: headerAnim.interpolate({
									inputRange: [0, 1],
									outputRange: [-14, 0],
								}),
							},
						],
					},
				]}
			>
				<Pressable style={styles.backBtn} onPress={goBack} hitSlop={10}>
					<Ionicons name="arrow-back" size={20} color="#0F172A" />
				</Pressable>
				<ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
				<View style={styles.headerRightPlaceholder} />
			</Animated.View>

			<ScrollView
				style={styles.page}
				contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View
					style={[
						styles.card,
						{ minHeight: Math.max(screenHeight * 0.72, 520) },
						{
							opacity: cardAnim,
							transform: [
								{
									translateY: cardAnim.interpolate({
										inputRange: [0, 1],
										outputRange: [20, 0],
									}),
								},
							],
						},
					]}
				>
					<ThemedText style={styles.cardTitle}>Profile Information</ThemedText>

					<TextInput
						style={styles.input}
						value={form.firstName}
						onChangeText={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
						placeholder="First Name"
						placeholderTextColor="#94A3B8"
					/>
					<TextInput
						style={styles.input}
						value={form.lastName}
						onChangeText={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
						placeholder="Last Name"
						placeholderTextColor="#94A3B8"
					/>
					<TextInput
						style={styles.input}
						value={form.email}
						onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
						placeholder="Email"
						placeholderTextColor="#94A3B8"
						keyboardType="email-address"
					/>
					<TextInput
						style={styles.input}
						value={form.phone}
						onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
						placeholder="Phone"
						placeholderTextColor="#94A3B8"
						keyboardType="phone-pad"
					/>
					<TextInput
						style={styles.input}
						value={form.city}
						onChangeText={(value) => setForm((prev) => ({ ...prev, city: value }))}
						placeholder="City"
						placeholderTextColor="#94A3B8"
					/>

					<Pressable style={styles.saveBtn} onPress={onSave}>
						<ThemedText style={styles.saveBtnText}>Save Profile</ThemedText>
					</Pressable>

					{message ? <ThemedText style={styles.messageText}>{message}</ThemedText> : null}
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F3F7F6',
	},
	header: {
		height: 56,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E2E8F0',
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: '800',
		color: '#0F172A',
	},
	headerRightPlaceholder: {
		width: 36,
		height: 36,
	},
	page: {
		flex: 1,
	},
	container: {
		padding: 16,
	},
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		borderTopWidth: 4,
		borderTopColor: '#3C6E71',
		borderWidth: 1,
		borderColor: '#DCE5E8',
		padding: 18,
		gap: 12,
		shadowColor: '#0F172A',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 16,
		elevation: 6,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: '800',
		color: '#1E293B',
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: '#CBD5E1',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 15,
		color: '#1F2937',
		backgroundColor: '#F8FAFC',
	},
	saveBtn: {
		marginTop: 10,
		backgroundColor: '#0F766E',
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		shadowColor: '#0F766E',
		shadowOpacity: 0.26,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 10,
		elevation: 3,
	},
	saveBtnText: {
		fontSize: 16,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	messageText: {
		marginTop: 4,
		fontSize: 13,
		fontWeight: '700',
		color: '#0F766E',
	},
});
