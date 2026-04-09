import { useEffect, useRef } from 'react';
import { Animated, Platform, type ViewStyle } from 'react-native';

type FadeInViewProps = {
	duration?: number;
	delay?: number;
	distance?: number;
	style?: ViewStyle | ViewStyle[];
	children: React.ReactNode;
};

export default function FadeInView({
	duration = 220,
	delay = 0,
	distance = 6,
	style,
	children,
}: FadeInViewProps) {
	const opacity = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(distance)).current;
	const useNativeDriver = Platform.OS !== 'web';

	useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration,
				delay,
				useNativeDriver,
			}),
			Animated.timing(translateY, {
				toValue: 0,
				duration,
				delay,
				useNativeDriver,
			}),
		]).start();
	}, [delay, distance, duration, opacity, translateY, useNativeDriver]);

	return (
		<Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
			{children}
		</Animated.View>
	);
}
