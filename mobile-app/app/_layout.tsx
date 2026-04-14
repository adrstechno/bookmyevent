import { Stack } from 'expo-router';
import { Component, type ErrorInfo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';

import { AppToastProvider } from '@/components/common/AppToastProvider';
import { AppPalettes } from '@/constants/theme';
import { clearApiAuthToken, setApiAuthToken, setOnTokenInvalidCallback } from '@/services/api/client';
import { useAppDispatch, useAppSelector, store } from '@/store';
import { bootstrapAuth, handleSessionExpired } from '@/store/slices/authSlice';
import { useSettingsTheme } from '@/theme/settingsTheme';
import { getTokenExpiryTimeMs } from '@/utils/jwt';

type AppErrorBoundaryState = {
	hasError: boolean;
	errorMessage: string;
};

type AppPalette = (typeof AppPalettes)[keyof typeof AppPalettes];

type AppErrorBoundaryProps = {
	children: React.ReactNode;
	palette: AppPalette;
};

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
	state: AppErrorBoundaryState = {
		hasError: false,
		errorMessage: '',
	};

	static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
		return {
			hasError: true,
			errorMessage: error?.message ?? 'Unexpected error occurred.',
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('AppErrorBoundary caught error:', error, errorInfo);
	}

	private onTryAgain = () => {
		this.setState({ hasError: false, errorMessage: '' });
	};

	render() {
		if (this.state.hasError) {
			const { palette } = this.props;
			return (
				<View style={[styles.errorWrap, { backgroundColor: palette.screenBg }]}>
					<Text style={[styles.errorTitle, { color: palette.text }]}>Something went wrong</Text>
					<Text style={[styles.errorSubtitle, { color: palette.subtext }]}>The app ran into an unexpected issue. Please try again.</Text>
					<Text style={[styles.errorHint, { color: palette.muted }]}>Error: {this.state.errorMessage}</Text>
					<Pressable style={[styles.errorBtn, { backgroundColor: palette.primary }]} onPress={this.onTryAgain}>
						<Text style={[styles.errorBtnText, { color: palette.onPrimary }]}>Try Again</Text>
					</Pressable>
				</View>
			);
		}

		return this.props.children;
	}
}

function GlobalLoadingScreen({ palette }: { palette: AppPalette }) {
	const logoScale = useRef(new Animated.Value(0.96)).current;
	const logoFade = useRef(new Animated.Value(0.7)).current;
	const dotAnim1 = useRef(new Animated.Value(0.3)).current;
	const dotAnim2 = useRef(new Animated.Value(0.3)).current;
	const dotAnim3 = useRef(new Animated.Value(0.3)).current;

	useEffect(() => {
		const logoScaleLoop = Animated.loop(
			Animated.sequence([
				Animated.timing(logoScale, {
					toValue: 1.02,
					duration: 900,
					useNativeDriver: true,
				}),
				Animated.timing(logoScale, {
					toValue: 0.96,
					duration: 900,
					useNativeDriver: true,
				}),
			]),
		);

		const logoFadeLoop = Animated.loop(
			Animated.sequence([
				Animated.timing(logoFade, {
					toValue: 1,
					duration: 900,
					useNativeDriver: true,
				}),
				Animated.timing(logoFade, {
					toValue: 0.7,
					duration: 900,
					useNativeDriver: true,
				}),
			]),
		);

		const dotLoop = (dot: Animated.Value, delay: number) =>
			Animated.loop(
				Animated.sequence([
					Animated.delay(delay),
					Animated.timing(dot, {
						toValue: 1,
						duration: 350,
						useNativeDriver: true,
					}),
					Animated.timing(dot, {
						toValue: 0.3,
						duration: 350,
						useNativeDriver: true,
					}),
				]),
			);

		const dot1Loop = dotLoop(dotAnim1, 0);
		const dot2Loop = dotLoop(dotAnim2, 180);
		const dot3Loop = dotLoop(dotAnim3, 360);

		logoScaleLoop.start();
		logoFadeLoop.start();
		dot1Loop.start();
		dot2Loop.start();
		dot3Loop.start();
	}, [dotAnim1, dotAnim2, dotAnim3, logoFade, logoScale]);

	return (
		<View style={[styles.loaderWrap, { backgroundColor: palette.screenBg }]}> 
			<View style={styles.decorativeBackground} pointerEvents="none">
				<View style={[styles.circle, styles.circleOne]} />
				<View style={[styles.circle, styles.circleTwo]} />
			</View>
			<Animated.Image
				source={require('../assets/images/mobile_logo.png')}
				style={[styles.logo, { opacity: logoFade, transform: [{ scale: logoScale }] }]}
				resizeMode="contain"
			/>
			<Text style={[styles.brandText, { color: palette.primary }]}>GoEventify</Text>
			<Text style={[styles.loaderText, { color: palette.subtext }]}>Preparing your event world...</Text>
			<View style={styles.dotRow}>
				<Animated.View style={[styles.dot, { opacity: dotAnim1, transform: [{ scale: dotAnim1.interpolate({ inputRange: [0.3, 1], outputRange: [0.8, 1.12] }) }] }]} />
				<Animated.View style={[styles.dot, { opacity: dotAnim2, transform: [{ scale: dotAnim2.interpolate({ inputRange: [0.3, 1], outputRange: [0.8, 1.12] }) }] }]} />
				<Animated.View style={[styles.dot, { opacity: dotAnim3, transform: [{ scale: dotAnim3.interpolate({ inputRange: [0.3, 1], outputRange: [0.8, 1.12] }) }] }]} />
			</View>
		</View>
	);
}

function RootNavigator() {
const dispatch = useAppDispatch();
const { isHydrated, token } = useAppSelector((state) => state.auth);
const { palette } = useSettingsTheme();

useEffect(() => {
dispatch(bootstrapAuth());
}, [dispatch]);

useEffect(() => {
// Register callback for when API detects invalid/expired token (401/403)
// This will automatically log out the user and clear their session
setOnTokenInvalidCallback(() => {
console.log('[RootNavigator] Token invalid/expired. Logging out...');
void dispatch(handleSessionExpired());
});

return () => {
setOnTokenInvalidCallback(null);
};
}, [dispatch]);

useEffect(() => {
if (token) {
setApiAuthToken(token);
return;
}

clearApiAuthToken();
}, [token]);

useEffect(() => {
if (!token) {
return;
}

const expiryTimeMs = getTokenExpiryTimeMs(token);
if (!expiryTimeMs) {
return;
}

const msUntilExpiry = expiryTimeMs - Date.now();
if (msUntilExpiry <= 0) {
void dispatch(handleSessionExpired());
return;
}

const timeoutId = setTimeout(() => {
console.log('[RootNavigator] Token reached expiry time. Logging out...');
void dispatch(handleSessionExpired());
}, msUntilExpiry);

return () => {
clearTimeout(timeoutId);
};
}, [dispatch, token]);

if (!isHydrated) {
return <GlobalLoadingScreen palette={palette} />;
}

return (
<Stack screenOptions={{ headerShown: false }}>
<Stack.Screen name="(auth)" options={{ headerShown: false }} />
<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
<Stack.Screen name="(vendor)" options={{ headerShown: false }} />
<Stack.Screen name="(admin)" options={{ headerShown: false }} />
<Stack.Screen name="notifications" options={{ headerShown: false }} />
<Stack.Screen name="app-error" options={{ headerShown: false }} />
<Stack.Screen name="about-us" options={{ headerShown: false }} />
<Stack.Screen name="profile-edit" options={{ headerShown: false }} />
<Stack.Screen name="favorites" options={{ headerShown: false }} />
<Stack.Screen name="settings" options={{ headerShown: false }} />
<Stack.Screen name="support" options={{ headerShown: false }} />
</Stack>
);
}

export default function RootLayout() {
	const { palette } = useSettingsTheme();

	return (
		<Provider store={store}>
			<AppToastProvider>
				<AppErrorBoundary palette={palette}>
					<RootNavigator />
				</AppErrorBoundary>
			</AppToastProvider>
		</Provider>
	);
}

const styles = StyleSheet.create({
	loaderWrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	decorativeBackground: {
		...StyleSheet.absoluteFillObject,
		alignItems: 'center',
		justifyContent: 'center',
	},
	circle: {
		position: 'absolute',
		borderRadius: 200,
	},
	circleOne: {
		height: 240,
		width: 240,
		backgroundColor: 'rgba(192, 50, 107, 0.12)',
		top: -80,
		right: -80,
	},
	circleTwo: {
		height: 180,
		width: 180,
		backgroundColor: 'rgba(248, 192, 160, 0.16)',
		bottom: -40,
		left: -30,
	},
	brandBlock: {
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	logo: {
		height: 120,
		width: 200,
		marginBottom: 8,
	},
	dotRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		marginTop: 18,
	},
	dot: {
		height: 12,
		width: 12,
		borderRadius: 8,
		backgroundColor: '#C0326B',
	},
	brandText: {
		fontSize: 24,
		fontWeight: '800',
		letterSpacing: 0.4,
	},
	loaderText: {
		fontSize: 15,
		fontWeight: '700',
		textAlign: 'center',
		maxWidth: 260,
	},
	indicator: {
		marginTop: 18,
	},
	errorWrap: {
		flex: 1,
		paddingHorizontal: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	errorTitle: {
		fontSize: 24,
		fontWeight: '800',
		textAlign: 'center',
	},
	errorSubtitle: {
		marginTop: 10,
		fontSize: 14,
		lineHeight: 20,
		textAlign: 'center',
	},
	errorHint: {
		marginTop: 8,
		fontSize: 12,
		textAlign: 'center',
	},
	errorBtn: {
		marginTop: 18,
		paddingHorizontal: 18,
		paddingVertical: 10,
		borderRadius: 10,
	},
	errorBtnText: {
		fontSize: 14,
		fontWeight: '700',
	},
});
