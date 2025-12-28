import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Baby, ChevronLeft, ChevronRight, Info, Star, Target } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../src/lib/api';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#3A86FF',
    secondary: '#8B5CF6',
    accent: '#F43F5E',
    background: '#F8FAFC',
    white: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
};

interface WeeklyData {
    week: number;
    trimester: number;
    babySize: string;
    babyWeight: string;
    babyLength: string;
    development: string[];
    motherChanges: string[];
    tips: string[];
}

export default function BabyGrowthScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [currentWeek, setCurrentWeek] = useState(4);
    const [activeWeekData, setActiveWeekData] = useState<WeeklyData | null>(null);
    const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

    const fetchGrowthData = async (week?: number) => {
        try {
            setLoading(true);
            const url = week ? `/mobile-baby-growth?week=${week}` : '/mobile-baby-growth';
            const res = await api.get(url);
            setActiveWeekData(res.data.data);
            setCurrentWeek(res.data.requestedWeek);
            if (res.data.allAvailableWeeks) {
                setAvailableWeeks(res.data.allAvailableWeeks);
            }
        } catch (error) {
            console.error('[BabyGrowth] Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrowthData();
    }, []);

    const handleNext = () => {
        const nextIdx = availableWeeks.indexOf(currentWeek) + 1;
        if (nextIdx < availableWeeks.length) {
            fetchGrowthData(availableWeeks[nextIdx]);
        }
    };

    const handlePrev = () => {
        const prevIdx = availableWeeks.indexOf(currentWeek) - 1;
        if (prevIdx >= 0) {
            fetchGrowthData(availableWeeks[prevIdx]);
        }
    };

    if (loading && !activeWeekData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Baby's Growth</Text>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Week Selector */}
                <View style={styles.weekSelector}>
                    <TouchableOpacity onPress={handlePrev} disabled={availableWeeks.indexOf(currentWeek) === 0} style={styles.navButton}>
                        <ChevronLeft size={24} color={availableWeeks.indexOf(currentWeek) === 0 ? '#CBD5E1' : COLORS.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.weekInfo}>
                        <Text style={styles.weekLabel}>WEEK</Text>
                        <Text style={styles.weekNumber}>{currentWeek}</Text>
                        <Text style={styles.trimesterLabel}>Trimester {activeWeekData?.trimester}</Text>
                    </View>
                    <TouchableOpacity onPress={handleNext} disabled={availableWeeks.indexOf(currentWeek) === availableWeeks.length - 1} style={styles.navButton}>
                        <ChevronRight size={24} color={availableWeeks.indexOf(currentWeek) === availableWeeks.length - 1 ? '#CBD5E1' : COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Size Comparison Card */}
                <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sizeCard}
                >
                    <View style={styles.sizeHeader}>
                        <Text style={styles.sizeTitle}>Your baby is as big as a...</Text>
                        <Text style={styles.sizeSubject}>{activeWeekData?.babySize}</Text>
                    </View>
                    <View style={styles.sizeIllustration}>
                        <View style={styles.iconCircle}>
                            <Baby size={48} color={COLORS.white} />
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{activeWeekData?.babyLength}</Text>
                            <Text style={styles.statLabel}>Length</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{activeWeekData?.babyWeight}</Text>
                            <Text style={styles.statLabel}>Weight</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Development Milestones */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Star size={20} color={COLORS.accent} fill={COLORS.accent} />
                        <Text style={styles.sectionTitle}>What's Developing</Text>
                    </View>
                    <View style={styles.milestoneList}>
                        {activeWeekData?.development.map((item, index) => (
                            <View key={index} style={styles.milestoneItem}>
                                <View style={styles.dot} />
                                <Text style={styles.milestoneText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Mother's Body */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Target size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Your Body this Week</Text>
                    </View>
                    <View style={styles.cardList}>
                        {activeWeekData?.motherChanges.map((item, index) => (
                            <View key={index} style={styles.infoCard}>
                                <Info size={18} color={COLORS.secondary} style={{ marginRight: 12 }} />
                                <Text style={styles.infoText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Weekly Tips */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.tipIconBg}>
                            <Text style={{ fontSize: 16 }}>💡</Text>
                        </View>
                        <Text style={styles.sectionTitle}>Weekly Tips</Text>
                    </View>
                    {activeWeekData?.tips.map((item, index) => (
                        <View key={index} style={styles.tipItem}>
                            <Text style={styles.tipText}>{item}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
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
    scrollContent: { padding: 20, paddingBottom: 40 },
    weekSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    navButton: { padding: 8 },
    weekInfo: { alignItems: 'center' },
    weekLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary, letterSpacing: 1 },
    weekNumber: { fontSize: 36, fontWeight: '900', color: COLORS.primary },
    trimesterLabel: { fontSize: 12, fontWeight: '700', color: COLORS.secondary, marginTop: -4 },
    sizeCard: {
        borderRadius: 32,
        padding: 24,
        marginBottom: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    sizeHeader: { marginBottom: 20 },
    sizeTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
    sizeSubject: { color: COLORS.white, fontSize: 32, fontWeight: '900', marginTop: 4 },
    sizeIllustration: { alignItems: 'center', marginVertical: 10 },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: 16,
        marginTop: 20,
    },
    statBox: { flex: 1, alignItems: 'center' },
    statValue: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
    statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginLeft: 10 },
    milestoneList: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, borderLeftWidth: 4, borderLeftColor: COLORS.accent },
    milestoneItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent, marginTop: 7, marginRight: 12 },
    milestoneText: { flex: 1, fontSize: 15, color: COLORS.textPrimary, lineHeight: 22 },
    cardList: { gap: 12 },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    infoText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
    tipIconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
    tipItem: {
        backgroundColor: '#FFFBEB',
        padding: 16,
        borderRadius: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    tipText: { fontSize: 14, color: '#92400E', lineHeight: 20, fontWeight: '600' },
});
