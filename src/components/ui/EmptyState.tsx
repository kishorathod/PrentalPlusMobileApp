import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import theme from '../../lib/theme';
import { Button } from './';

type EmptyStateProps = {
    icon?: LucideIcon;
    emoji?: string;
    title: string;
    message: string;
    actionLabel?: string;
    onActionPress?: () => void;
    secondaryActionLabel?: string;
    onSecondaryActionPress?: () => void;
};

export default function EmptyState({
    icon: Icon,
    emoji,
    title,
    message,
    actionLabel,
    onActionPress,
    secondaryActionLabel,
    onSecondaryActionPress,
}: EmptyStateProps) {
    return (
        <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.container}
        >
            {/* Icon or Emoji */}
            <View style={styles.iconContainer}>
                {emoji ? (
                    <Text style={styles.emoji}>{emoji}</Text>
                ) : Icon ? (
                    <View style={styles.iconWrapper}>
                        <Icon size={48} color={theme.colors.primary[500]} strokeWidth={1.5} />
                    </View>
                ) : null}
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Actions */}
            {(actionLabel || secondaryActionLabel) && (
                <View style={styles.actionsContainer}>
                    {actionLabel && onActionPress && (
                        <Button
                            onPress={onActionPress}
                            size="md"
                            style={styles.primaryButton}
                        >
                            {actionLabel}
                        </Button>
                    )}
                    {secondaryActionLabel && onSecondaryActionPress && (
                        <Button
                            onPress={onSecondaryActionPress}
                            variant="outline"
                            size="md"
                            style={styles.secondaryButton}
                        >
                            {secondaryActionLabel}
                        </Button>
                    )}
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing['2xl'],
    },
    iconContainer: {
        marginBottom: theme.spacing.lg,
    },
    emoji: {
        fontSize: 64,
        textAlign: 'center',
    },
    iconWrapper: {
        width: 96,
        height: 96,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.extrabold,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    message: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: theme.spacing.xl,
        maxWidth: 320,
    },
    actionsContainer: {
        width: '100%',
        gap: theme.spacing.sm,
    },
    primaryButton: {
        width: '100%',
    },
    secondaryButton: {
        width: '100%',
    },
});
