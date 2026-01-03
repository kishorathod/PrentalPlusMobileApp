import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightImpact, mediumImpact } from '../../lib/haptics';
import theme from '../../lib/theme';

type FABAction = {
    icon: LucideIcon;
    label: string;
    onPress: () => void;
    color?: string;
};

type FloatingActionButtonProps = {
    actions?: FABAction[];
    mainIcon?: LucideIcon;
    onPress?: () => void;
    gradientColors?: readonly [string, string];
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function FloatingActionButton({
    actions = [],
    mainIcon: MainIcon = Plus,
    onPress,
    gradientColors = theme.gradients.primary,
    position = 'bottom-right',
}: FloatingActionButtonProps) {
    const insets = useSafeAreaInsets();
    const [isExpanded, setIsExpanded] = useState(false);
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    const hasActions = actions.length > 0;

    const handleMainPress = () => {
        mediumImpact();

        if (hasActions) {
            const newExpanded = !isExpanded;
            setIsExpanded(newExpanded);

            rotation.value = withSpring(newExpanded ? 45 : 0, {
                damping: 15,
                stiffness: 200,
            });
        } else if (onPress) {
            scale.value = withSequence(
                withTiming(0.9, { duration: 100 }),
                withTiming(1, { duration: 100 })
            );
            onPress();
        }
    };

    const handleActionPress = (action: FABAction) => {
        lightImpact();
        setIsExpanded(false);
        rotation.value = withSpring(0, {
            damping: 15,
            stiffness: 200,
        });
        action.onPress();
    };

    const mainButtonStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${rotation.value}deg` },
            { scale: scale.value },
        ],
    }));

    const getPositionStyle = () => {
        const bottom = insets.bottom + 20;
        switch (position) {
            case 'bottom-left':
                return { bottom, left: theme.spacing.lg };
            case 'bottom-center':
                return { bottom, alignSelf: 'center' as const };
            case 'bottom-right':
            default:
                return { bottom, right: theme.spacing.lg };
        }
    };

    return (
        <View style={[styles.container, getPositionStyle()]}>
            {/* Action Items */}
            {hasActions && isExpanded && (
                <View style={styles.actionsContainer}>
                    {actions.map((action, index) => (
                        <ActionItem
                            key={index}
                            action={action}
                            index={index}
                            onPress={() => handleActionPress(action)}
                        />
                    ))}
                </View>
            )}

            {/* Main FAB */}
            <AnimatedTouchable
                style={[styles.fab, mainButtonStyle]}
                onPress={handleMainPress}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={[...gradientColors]}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <MainIcon size={28} color={theme.colors.white} />
                </LinearGradient>
            </AnimatedTouchable>

            {/* Backdrop */}
            {isExpanded && (
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={() => {
                        setIsExpanded(false);
                        rotation.value = withSpring(0, {
                            damping: 15,
                            stiffness: 200,
                        });
                    }}
                />
            )}
        </View>
    );
}

function ActionItem({
    action,
    index,
    onPress,
}: {
    action: FABAction;
    index: number;
    onPress: () => void;
}) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
        translateY.value = withSpring(0, {
            damping: 15,
            stiffness: 200,
            delay: index * 50,
        });
        opacity.value = withTiming(1, {
            duration: 200,
            delay: index * 50,
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const ActionIcon = action.icon;

    return (
        <Animated.View style={[styles.actionItem, animatedStyle]}>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <TouchableOpacity
                style={[
                    styles.actionButton,
                    { backgroundColor: action.color || theme.colors.white },
                ]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <ActionIcon size={20} color={theme.colors.primary[500]} />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: theme.zIndex.fixed,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: theme.borderRadius.full,
        ...theme.shadows.xl,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: theme.borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionsContainer: {
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    actionLabel: {
        backgroundColor: theme.colors.white,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text.primary,
        ...theme.shadows.md,
    },
    actionButton: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.lg,
    },
});
