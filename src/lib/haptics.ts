/**
 * Haptic Feedback Utilities
 * 
 * Provides consistent haptic feedback across the app for better user experience.
 * Uses expo-haptics for cross-platform haptic support.
 */

import * as Haptics from 'expo-haptics';

/**
 * Light impact - for subtle interactions like button presses
 */
export const lightImpact = async () => {
    try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
        // Haptics might not be available on all devices
        console.debug('Haptics not available:', error);
    }
};

/**
 * Medium impact - for confirmations and selections
 */
export const mediumImpact = async () => {
    try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
        console.debug('Haptics not available:', error);
    }
};

/**
 * Heavy impact - for important actions like deletions
 */
export const heavyImpact = async () => {
    try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
        console.debug('Haptics not available:', error);
    }
};

/**
 * Success notification - for successful operations
 */
export const successNotification = async () => {
    try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
        console.debug('Haptics not available:', error);
    }
};

/**
 * Warning notification - for warnings
 */
export const warningNotification = async () => {
    try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
        console.debug('Haptics not available:', error);
    }
};

/**
 * Error notification - for errors
 */
export const errorNotification = async () => {
    try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
        console.debug('Haptics not available:', error);
    }
};

/**
 * Selection changed - for picker/selector changes
 */
export const selectionChanged = async () => {
    try {
        await Haptics.selectionAsync();
    } catch (error) {
        console.debug('Haptics not available:', error);
    }
};

export default {
    lightImpact,
    mediumImpact,
    heavyImpact,
    successNotification,
    warningNotification,
    errorNotification,
    selectionChanged,
};
