import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../lib/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type BottomSheetProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    snapPoints?: number[]; // Percentages of screen height (e.g., [0.5, 0.9])
    enableBackdropDismiss?: boolean;
    backdropOpacity?: number;
};

export default function BottomSheet({
    visible,
    onClose,
    children,
    snapPoints = [0.6],
    enableBackdropDismiss = true,
    backdropOpacity = 0.5,
}: BottomSheetProps) {
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const backdropOpacityValue = useSharedValue(0);

    const maxSnapPoint = Math.max(...snapPoints);
    const sheetHeight = SCREEN_HEIGHT * maxSnapPoint;

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, {
                damping: 50,
                stiffness: 400,
            });
            backdropOpacityValue.value = withTiming(backdropOpacity, { duration: 300 });
        } else {
            translateY.value = withSpring(SCREEN_HEIGHT, {
                damping: 50,
                stiffness: 400,
            });
            backdropOpacityValue.value = withTiming(0, { duration: 200 });
        }
    }, [visible]);

    const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
        onStart: (_, context: any) => {
            context.startY = translateY.value;
        },
        onActive: (event, context: any) => {
            const newTranslateY = context.startY + event.translationY;
            if (newTranslateY >= 0) {
                translateY.value = newTranslateY;
                // Reduce backdrop opacity as sheet is dragged down
                const progress = Math.min(newTranslateY / (sheetHeight * 0.5), 1);
                backdropOpacityValue.value = backdropOpacity * (1 - progress);
            }
        },
        onEnd: (event) => {
            const shouldClose = event.translationY > sheetHeight * 0.3 || event.velocityY > 500;

            if (shouldClose) {
                translateY.value = withSpring(SCREEN_HEIGHT, {
                    damping: 50,
                    stiffness: 400,
                });
                backdropOpacityValue.value = withTiming(0, { duration: 200 });
                runOnJS(onClose)();
            } else {
                translateY.value = withSpring(0, {
                    damping: 50,
                    stiffness: 400,
                });
                backdropOpacityValue.value = withTiming(backdropOpacity, { duration: 200 });
            }
        },
    });

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacityValue.value,
    }));

    const handleBackdropPress = () => {
        if (enableBackdropDismiss) {
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, backdropStyle]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={handleBackdropPress}
                    />
                </Animated.View>

                {/* Bottom Sheet */}
                <PanGestureHandler onGestureEvent={gestureHandler}>
                    <Animated.View
                        style={[
                            styles.sheet,
                            {
                                height: sheetHeight + insets.bottom,
                                paddingBottom: insets.bottom,
                            },
                            sheetStyle,
                        ]}
                    >
                        {/* Handle */}
                        <View style={styles.handleContainer}>
                            <View style={styles.handle} />
                        </View>

                        {/* Content */}
                        <View style={styles.content}>{children}</View>
                    </Animated.View>
                </PanGestureHandler>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.black,
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        ...theme.shadows.xl,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.gray[300],
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
});
