import { StatusBar } from 'expo-status-bar';
import {
    Baby,
    ChevronRight,
    Clock,
    History,
    Play,
    Square,
    Timer,
    TrendingUp
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../src/lib/api';

const { width } = Dimensions.get('window');

type KickSession = {
    id: string;
    count: number;
    duration: number;
    startedAt: string;
    completedAt?: string;
    notes?: string;
};

type KickStats = {
    totalSessions: number;
    totalKicks: number;
    averageDuration: number;
    lastSession: KickSession | null;
};

const COLORS = {
    primary: '#3A86FF',
    secondary: '#FF8FA3',
    background: '#F2F6FC',
    card: '#FFFFFF',
    text: '#1E293B',
    textLight: '#64748B',
    danger: '#EF4444',
    success: '#10B981',
};

export default function KickCounterScreen() {
    const insets = useSafeAreaInsets();
    const [sessions, setSessions] = useState<KickSession[]>([]);
    const [stats, setStats] = useState<KickStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCounting, setIsCounting] = useState(false);
    const [currentCount, setCurrentCount] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<any>(null);

    const fetchKickData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/kick-counts');
            setSessions(res.data.kickCounts || []);
            setStats(res.data.stats);
        } catch (error) {
            console.error('Failed to fetch kick counts:', error);
            Alert.alert('Error', 'Failed to load kick counter data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKickData();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startSession = () => {
        setIsCounting(true);
        setCurrentCount(0);
        setStartTime(new Date());
        setElapsedTime(0);

        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    };

    const countKick = () => {
        setCurrentCount(prev => prev + 1);
    };

    const stopSession = async () => {
        if (!startTime) return;

        const durationMinutes = Math.ceil(elapsedTime / 60);

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        try {
            const dashboardRes = await api.get('/mobile-dashboard');
            const pregnancyId = dashboardRes.data.pregnancy?.id;

            if (!pregnancyId) {
                Alert.alert('Error', 'No active pregnancy found to link this session.');
                setIsCounting(false);
                return;
            }

            await api.post('/kick-counts', {
                count: currentCount,
                duration: durationMinutes,
                pregnancyId,
                startedAt: startTime.toISOString(),
                completedAt: new Date().toISOString()
            });

            Alert.alert('Success', 'Kick session saved successfully!');
            setIsCounting(false);
            fetchKickData();
        } catch (error) {
            console.error('Failed to save kick session:', error);
            Alert.alert('Error', 'Failed to save session');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading && sessions.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading your sessions...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerTitle}>Kick Counter</Text>
                        <Text style={styles.headerSubtitle}>Monitor baby's movements</Text>
                    </View>
                    <View style={styles.headerIconContainer}>
                        <Baby size={28} color={COLORS.primary} />
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Active Session Card */}
                <View style={styles.activeCard}>
                    {isCounting ? (
                        <View style={styles.countingContent}>
                            <View style={styles.timerBadge}>
                                <Timer size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                                <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                            </View>

                            <Text style={styles.kicksCount}>{currentCount}</Text>
                            <Text style={styles.kicksLabel}>KICKS DETECTED</Text>

                            <TouchableOpacity
                                style={styles.kickButton}
                                onPress={countKick}
                                activeOpacity={0.8}
                            >
                                <View style={styles.kickButtonInner}>
                                    <Baby size={48} color="white" />
                                    <Text style={styles.kickButtonText}>TAP KICK</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.stopButton} onPress={stopSession}>
                                <Square size={16} color={COLORS.danger} style={{ marginRight: 8 }} />
                                <Text style={styles.stopButtonText}>End Session</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.idleContent}>
                            <View style={styles.idleIconWrapper}>
                                <TrendingUp size={32} color={COLORS.primary} />
                            </View>
                            <Text style={styles.idleTitle}>New Tracking Session</Text>
                            <Text style={styles.idleText}>Find a relaxed position on your side and track how long it takes to feel 10 movements.</Text>
                            <TouchableOpacity style={styles.startButton} onPress={startSession}>
                                <Play size={18} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.startButtonText}>Start Counting</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Stats Overview */}
                {stats && (
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <View style={[styles.statIcon, { backgroundColor: '#E0F2FE' }]}>
                                <History size={18} color="#0EA5E9" />
                            </View>
                            <Text style={styles.statValue}>{stats.totalSessions}</Text>
                            <Text style={styles.statLabel}>Total Logs</Text>
                        </View>
                        <View style={styles.statBox}>
                            <View style={[styles.statIcon, { backgroundColor: '#FFF1F2' }]}>
                                <Baby size={18} color="#F43F5E" />
                            </View>
                            <Text style={styles.statValue}>{stats.totalKicks}</Text>
                            <Text style={styles.statLabel}>Total Kicks</Text>
                        </View>
                        <View style={styles.statBox}>
                            <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
                                <Clock size={18} color="#10B981" />
                            </View>
                            <Text style={styles.statValue}>{Math.round(stats.averageDuration)}m</Text>
                            <Text style={styles.statLabel}>Avg Time</Text>
                        </View>
                    </View>
                )}

                {/* History */}
                <View style={styles.historyContainer}>
                    <Text style={styles.sectionTitle}>Recent Sessions</Text>
                    {sessions.length > 0 ? (
                        sessions.map((session) => (
                            <View key={session.id} style={styles.historyCard}>
                                <View style={styles.historyIcon}>
                                    <Baby size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.historyInfo}>
                                    <View style={styles.historyHeader}>
                                        <Text style={styles.historyDate}>{formatDate(session.startedAt)}</Text>
                                        <View style={styles.kicksBadge}>
                                            <Text style={styles.historyKicks}>{session.count} Kicks</Text>
                                        </View>
                                    </View>
                                    <View style={styles.historyFooter}>
                                        <View style={styles.footerItem}>
                                            <Clock size={12} color={COLORS.textLight} style={{ marginRight: 4 }} />
                                            <Text style={styles.historyDuration}>{session.duration} mins</Text>
                                        </View>
                                        {session.notes && <Text style={styles.historyNotes} numberOfLines={1}>{session.notes}</Text>}
                                    </View>
                                </View>
                                <ChevronRight size={18} color="#CBD5E1" />
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyHistory}>
                            <Baby size={48} color="#E2E8F0" style={{ marginBottom: 12 }} />
                            <Text style={styles.emptyText}>No sessions recorded yet.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textLight,
        fontSize: 14,
    },
    header: {
        backgroundColor: 'white',
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 2,
    },
    headerIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F7FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: 24,
    },
    activeCard: {
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    idleContent: {
        alignItems: 'center',
    },
    idleIconWrapper: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F0F7FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    idleTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 10,
    },
    idleText: {
        fontSize: 15,
        color: COLORS.textLight,
        textAlign: 'center',
        paddingHorizontal: 10,
        marginBottom: 28,
        lineHeight: 22,
    },
    startButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    startButtonText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
    },
    countingContent: {
        width: '100%',
        alignItems: 'center',
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F7FF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        marginBottom: 20,
    },
    timerText: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.primary,
        fontVariant: ['tabular-nums'],
    },
    kicksCount: {
        fontSize: 84,
        fontWeight: '900',
        color: COLORS.text,
        lineHeight: 94,
    },
    kicksLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textLight,
        letterSpacing: 1.5,
        marginBottom: 32,
    },
    kickButton: {
        marginBottom: 32,
    },
    kickButtonInner: {
        backgroundColor: COLORS.primary,
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 8,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    kickButtonText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 14,
        marginTop: 10,
    },
    stopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    stopButtonText: {
        color: COLORS.danger,
        fontWeight: '700',
        fontSize: 15,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statBox: {
        backgroundColor: 'white',
        width: '31%',
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '600',
        marginTop: 2,
    },
    historyContainer: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 18,
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    historyIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#F0F7FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    historyInfo: {
        flex: 1,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    historyDate: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },
    kicksBadge: {
        backgroundColor: '#F0F7FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    historyKicks: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.primary,
    },
    historyFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    historyDuration: {
        fontSize: 13,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    historyNotes: {
        flex: 1,
        fontSize: 12,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    emptyHistory: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    emptyText: {
        color: '#94A3B8',
        fontWeight: '600',
        fontSize: 14,
    },
});
