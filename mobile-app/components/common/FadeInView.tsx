import { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

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

	useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration,
				delay,
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: 0,
				duration,
				delay,
				useNativeDriver: true,
			}),
		]).start();
	}, [delay, distance, duration, opacity, translateY]);

	return (
		<Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
			{children}
		</Animated.View>
	);
}
