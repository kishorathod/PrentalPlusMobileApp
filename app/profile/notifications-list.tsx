import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, Calendar, ChevronLeft, FileText, Heart, Info, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../src/lib/api';

const COLORS = {
    primary: '#3A86FF',
    background: '#F2F6FC',
    cardBackground: '#FFFFFF',
    textPrimary: '#0B132A',
    textSecondary: '#64748B',
    white: '#FFFFFF',
    border: '#E2E8F0',
    danger: '#FF4D4D',
};

export default function NotificationsListScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/mobile-dashboard'); // Using this for now as it returns recent notifs
            // In a more mature app, we'd have a dedicated /notifications endpoint
            setNotifications(res.data.recent.notifications || []);
        } catch (error) {
            console.error('[NotificationsList] Failed to fetch:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAsRead = async (id: string, currentlyRead: boolean) => {
        if (currentlyRead) return;

        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            await api.put(`/notifications/${id}`, { read: true });
        } catch (error) {
            console.error('[NotificationsList] Failed to mark as read:', error);
            // Revert on error if necessary
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.filter(n => n.id !== id));
            await api.delete(`/notifications/${id}`);
        } catch (error) {
            console.error('[NotificationsList] Failed to delete notification:', error);
            Alert.alert('Error', 'Failed to delete notification');
            fetchNotifications(); // Refresh to restore state
        }
    };

    const clearAll = () => {
        Alert.alert('Clear All', 'Are you sure you want to clear all notifications?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setNotifications([]);
                        await api.delete('/notifications');
                    } catch (error) {
                        console.error('[NotificationsList] Failed to clear all:', error);
                        Alert.alert('Error', 'Failed to clear notifications');
                        fetchNotifications();
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
                    <Trash2 size={20} color={COLORS.danger} />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <NotificationCard
                            notification={item}
                            onPress={() => markAsRead(item.id, item.read)}
                            onDelete={() => handleDelete(item.id)}
                        />
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconWrapper}>
                                <Bell size={48} color="#CBD5E1" />
                            </View>
                            <Text style={styles.emptyTitle}>No New Notifications</Text>
                            <Text style={styles.emptySubtitle}>We'll notify you when there's something new or important.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

function NotificationCard({ notification, onPress, onDelete }: { notification: any, onPress: () => void, onDelete: () => void }) {
    const getIcon = () => {
        switch (notification.type) {
            case 'VITAL_REMINDER': return <Heart size={20} color="#FF4D4D" />;
            case 'APPOINTMENT_REMINDER': return <Calendar size={20} color="#3A86FF" />;
            case 'HEALTH_ALERT': return <Bell size={20} color="#FF8FA3" />;
            case 'REPORT_UPLOADED': return <FileText size={20} color="#10B981" />;
            default: return <Info size={20} color="#64748B" />;
        }
    };

    const getBgColor = () => {
        switch (notification.type) {
            case 'VITAL_REMINDER': return '#FFE4E6';
            case 'APPOINTMENT_REMINDER': return '#E0F2FE';
            case 'HEALTH_ALERT': return '#FFF1F2';
            case 'REPORT_UPLOADED': return '#F0FDF4';
            default: return '#F1F5F9';
        }
    };

    return (
        <TouchableOpacity
            style={[styles.notifCard, !notification.read && styles.unreadCard]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconWrapper, { backgroundColor: getBgColor() }]}>
                {getIcon()}
            </View>
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{notification.title}</Text>
                    {!notification.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.cardMessage}>{notification.message}</Text>
                <Text style={styles.cardTime}>
                    {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <TouchableOpacity onPress={onDelete} style={styles.deleteCardBtn}>
                <Trash2 size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
    clearButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF1F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20, paddingBottom: 40 },
    notifCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        backgroundColor: '#F8FAFC',
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
    cardMessage: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 8 },
    cardTime: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
    deleteCardBtn: {
        padding: 8,
        alignSelf: 'center',
    },
});
