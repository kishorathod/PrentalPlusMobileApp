import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import theme from '../../lib/theme';

type SwipeAction = {
    component: React.ReactNode;
    width: number;
    backgroundColor?: string;
    onPress?: () => void;
};

type SwipeableCardProps = {
    children: React.ReactNode;
    leftAction?: SwipeAction;
    rightAction?: SwipeAction;
    style?: ViewStyle;
    threshold?: number; // Percentage of action width to trigger (0-1)
};

export default function SwipeableCard({
    children,
    leftAction,
    rightAction,
    style,
    threshold = 0.5,
}: SwipeableCardProps) {
    const translateX = useSharedValue(0);

    const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
        onStart: (_, context: any) => {
            context.startX = translateX.value;
        },
        onActive: (event, context: any) => {
            const newTranslateX = context.startX + event.translationX;

            // Limit swipe distance
            const maxLeft = leftAction ? -leftAction.width : 0;
            const maxRight = rightAction ? rightAction.width : 0;

            translateX.value = Math.max(maxLeft, Math.min(maxRight, newTranslateX));
        },
        onEnd: (event) => {
            const shouldTriggerLeft = leftAction && translateX.value < -(leftAction.width * threshold);
            const shouldTriggerRight = rightAction && translateX.value > (rightAction.width * threshold);

            if (shouldTriggerLeft && leftAction?.onPress) {
                runOnJS(leftAction.onPress)();
                translateX.value = withSpring(0);
            } else if (shouldTriggerRight && rightAction?.onPress) {
                runOnJS(rightAction.onPress)();
                translateX.value = withSpring(0);
            } else {
                // Snap back to center
                translateX.value = withSpring(0);
            }
        },
    });

    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const leftActionStyle = useAnimatedStyle(() => {
        if (!leftAction) return {};

        const opacity = interpolate(
            translateX.value,
            [0, -leftAction.width],
            [0, 1],
            Extrapolate.CLAMP
        );

        return { opacity };
    });

    const rightActionStyle = useAnimatedStyle(() => {
        if (!rightAction) return {};

        const opacity = interpolate(
            translateX.value,
            [0, rightAction.width],
            [0, 1],
            Extrapolate.CLAMP
        );

        return { opacity };
    });

    return (
        <View style={[styles.container, style]}>
            {/* Left Action */}
            {leftAction && (
                <Animated.View
                    style={[
                        styles.actionContainer,
                        styles.leftAction,
                        {
                            width: leftAction.width,
                            backgroundColor: leftAction.backgroundColor || theme.colors.danger[500],
                        },
                        leftActionStyle,
                    ]}
                >
                    {leftAction.component}
                </Animated.View>
            )}

            {/* Right Action */}
            {rightAction && (
                <Animated.View
                    style={[
                        styles.actionContainer,
                        styles.rightAction,
                        {
                            width: rightAction.width,
                            backgroundColor: rightAction.backgroundColor || theme.colors.success[500],
                        },
                        rightActionStyle,
                    ]}
                >
                    {rightAction.component}
                </Animated.View>
            )}

            {/* Card Content */}
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View style={[styles.card, cardStyle]}>
                    {children}
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    actionContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftAction: {
        left: 0,
    },
    rightAction: {
        right: 0,
    },
    card: {
        backgroundColor: theme.colors.white,
    },
});
