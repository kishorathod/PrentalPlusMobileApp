import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import theme from '../../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressRingProps = {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    gradientColors?: readonly [string, string];
    backgroundColor?: string;
    showPercentage?: boolean;
    duration?: number;
};

export default function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 12,
    gradientColors = theme.gradients.primary,
    backgroundColor = theme.colors.gray[200],
    showPercentage = true,
    duration = 1000,
}: ProgressRingProps) {
    const animatedProgress = useSharedValue(0);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    useEffect(() => {
        animatedProgress.value = withTiming(progress, {
            duration,
            easing: Easing.out(Easing.cubic),
        });
    }, [progress]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - (animatedProgress.value / 100) * circumference;
        return {
            strokeDashoffset,
        };
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                <Defs>
                    <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={gradientColors[0]} />
                        <Stop offset="100%" stopColor={gradientColors[1]} />
                    </SvgLinearGradient>
                </Defs>

                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* Progress Circle */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            {/* Percentage Text */}
            {showPercentage && (
                <View style={styles.textContainer}>
                    <Text style={styles.percentage}>{Math.round(progress)}%</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    textContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentage: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.extrabold,
        color: theme.colors.text.primary,
    },
});
