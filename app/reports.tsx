import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../src/lib/api';

type MedicalReport = {
    id: string;
    title: string;
    type: string;
    category?: string;
    reportDate?: string;
    doctorName?: string;
    fileName: string;
    fileUrl: string;
    createdAt: string;
};

export default function ReportsScreen() {
    const insets = useSafeAreaInsets();
    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string | null>(null);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reports');
            setReports(res.data.reports || []);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            Alert.alert('Error', 'Failed to load medical reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const categories = Array.from(new Set(reports.map(r => r.category).filter(Boolean)));

    const filteredReports = filter
        ? reports.filter(r => r.category === filter)
        : reports;

    if (loading && reports.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2563EB" />
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
                        <Text style={styles.headerTitle}>Medical Reports</Text>
                        <Text style={styles.headerSubtitle}>View and manage your health records</Text>
                    </View>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => Alert.alert('Coming Soon', 'Report upload feature will be available in the next update.')}>
                        <Text style={styles.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                {categories.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[styles.filterTab, !filter && styles.activeFilterTab]}
                            onPress={() => setFilter(null)}
                        >
                            <Text style={[styles.filterTabText, !filter && styles.activeFilterTabText]}>All</Text>
                        </TouchableOpacity>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.filterTab, filter === cat && styles.activeFilterTab]}
                                onPress={() => setFilter(cat!)}
                            >
                                <Text style={[styles.filterTabText, filter === cat && styles.activeFilterTabText]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                        <TouchableOpacity
                            key={report.id}
                            style={styles.reportCard}
                            onPress={() => Alert.alert(report.title, `Type: ${report.type}\nDoctor: ${report.doctorName || 'N/A'}\nDate: ${formatDate(report.reportDate || report.createdAt)}`)}
                        >
                            <View style={styles.reportIcon}>
                                <Text style={styles.reportIconText}>📄</Text>
                            </View>
                            <View style={styles.reportInfo}>
                                <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                                <View style={styles.reportMeta}>
                                    <Text style={styles.reportCategory}>{report.category || report.type}</Text>
                                    <Text style={styles.metaDivider}>•</Text>
                                    <Text style={styles.reportDate}>{formatDate(report.reportDate || report.createdAt)}</Text>
                                </View>
                                {report.doctorName && (
                                    <Text style={styles.reportDoctor}>Dr. {report.doctorName}</Text>
                                )}
                            </View>
                            <TouchableOpacity style={styles.viewBadge}>
                                <Text style={styles.viewBadgeText}>View</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>📁</Text>
                        <Text style={styles.emptyTitle}>No Reports Found</Text>
                        <Text style={styles.emptyText}>Any medical reports uploaded by you or your doctor will appear here.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: 'white',
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    uploadButton: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    uploadButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    filterContainer: {
        marginTop: 4,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        marginRight: 8,
    },
    activeFilterTab: {
        backgroundColor: '#2563EB',
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    activeFilterTabText: {
        color: 'white',
    },
    scrollContent: {
        padding: 20,
    },
    reportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    reportIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reportIconText: {
        fontSize: 24,
    },
    reportInfo: {
        flex: 1,
        marginLeft: 16,
        marginRight: 8,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    reportMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reportCategory: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563EB',
    },
    metaDivider: {
        marginHorizontal: 4,
        color: '#94A3B8',
    },
    reportDate: {
        fontSize: 12,
        color: '#64748B',
    },
    reportDoctor: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    viewBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    viewBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563EB',
    },
    emptyContainer: {
        paddingTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
    },
});
