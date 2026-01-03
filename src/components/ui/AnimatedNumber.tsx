import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

type AnimatedNumberProps = {
    value: number;
    duration?: number;
    style?: TextStyle;
    prefix?: string;
    suffix?: string;
    decimals?: number;
};

export default function AnimatedNumber({
    value,
    duration = 1000,
    style,
    prefix = '',
    suffix = '',
    decimals = 0,
}: AnimatedNumberProps) {
    const animatedValue = useSharedValue(0);

    useEffect(() => {
        animatedValue.value = withTiming(value, {
            duration,
            easing: Easing.out(Easing.cubic),
        });
    }, [value]);

    const animatedProps = useAnimatedProps(() => {
        const currentValue = animatedValue.value.toFixed(decimals);
        return {
            text: `${prefix}${currentValue}${suffix}`,
        } as any;
    });

    return <AnimatedText style={style} animatedProps={animatedProps} />;
}
