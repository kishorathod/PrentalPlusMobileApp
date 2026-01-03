import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type ToastProps = {
    visible: boolean;
    message: string;
    variant?: ToastVariant;
    duration?: number;
    onDismiss?: () => void;
    title?: string;
};

const TOAST_CONFIG = {
    success: {
        icon: CheckCircle,
        color: theme.colors.success[500],
        backgroundColor: theme.colors.success[50],
        borderColor: theme.colors.success[200],
    },
    error: {
        icon: AlertCircle,
        color: theme.colors.danger[500],
        backgroundColor: theme.colors.danger[50],
        borderColor: theme.colors.danger[200],
    },
    warning: {
        icon: AlertTriangle,
        color: theme.colors.warning[500],
        backgroundColor: theme.colors.warning[50],
        borderColor: theme.colors.warning[200],
    },
    info: {
        icon: Info,
        color: theme.colors.primary[500],
        backgroundColor: theme.colors.primary[50],
        borderColor: theme.colors.primary[200],
    },
};

export default function Toast({
    visible,
    message,
    variant = 'info',
    duration = 3000,
    onDismiss,
    title,
}: ToastProps) {
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(-200);
    const progress = useSharedValue(0);

    const config = TOAST_CONFIG[variant];
    const Icon = config.icon;

    useEffect(() => {
        if (visible) {
            // Slide in
            translateY.value = withSpring(0, {
                damping: 20,
                stiffness: 300,
            });

            // Progress bar animation
            progress.value = withTiming(1, { duration });

            // Auto dismiss
            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            translateY.value = withSpring(-200, {
                damping: 20,
                stiffness: 300,
            });
            progress.value = 0;
        }
    }, [visible]);

    const handleDismiss = () => {
        translateY.value = withSpring(-200, {
            damping: 20,
            stiffness: 300,
        });
        if (onDismiss) {
            setTimeout(onDismiss, 300);
        }
    };

    const toastStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    top: insets.top + 10,
                    backgroundColor: config.backgroundColor,
                    borderColor: config.borderColor,
                },
                toastStyle,
            ]}
        >
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
                    <Icon size={20} color={theme.colors.white} />
                </View>
                <View style={styles.textContainer}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    <Text style={styles.message} numberOfLines={2}>
                        {message}
                    </Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <Animated.View
                    style={[
                        styles.progressBar,
                        { backgroundColor: config.color },
                        progressStyle,
                    ]}
                />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: theme.spacing.md,
        right: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        overflow: 'hidden',
        ...theme.shadows.lg,
        zIndex: theme.zIndex.tooltip,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: theme.borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    message: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        lineHeight: 18,
    },
    progressContainer: {
        height: 3,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    progressBar: {
        height: '100%',
    },
});
