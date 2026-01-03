import { useRouter } from 'expo-router';
import { CheckCircle2, ChevronLeft, Circle, ClipboardList } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Card, ProgressBar } from '../../src/components/ui';
import { lightImpact, mediumImpact } from '../../src/lib/haptics';
import { TRIMESTER_CHECKLISTS } from '../../src/lib/pregnancy-data';
import theme from '../../src/lib/theme';

type TrimesterKey = '1st' | '2nd' | '3rd';

export default function ChecklistScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeTrimester, setActiveTrimester] = useState<TrimesterKey>('1st');

    // Local state for checked items (simulated)
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const toggleItem = (id: string) => {
        lightImpact();
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const currentTasks = TRIMESTER_CHECKLISTS.find(c => c.trimester === activeTrimester)?.tasks || [];
    const completedCount = currentTasks.filter(t => checkedItems[t.id]).length;
    const progress = currentTasks.length > 0 ? (completedCount / currentTasks.length) * 100 : 0;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity
                    onPress={() => {
                        lightImpact();
                        router.back();
                    }}
                    style={styles.backButton}
                >
                    <ChevronLeft size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pregnancy Checklist</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.trimesterTabs}>
                {(['1st', '2nd', '3rd'] as TrimesterKey[]).map((tri) => (
                    <TouchableOpacity
                        key={tri}
                        onPress={() => {
                            mediumImpact();
                            setActiveTrimester(tri);
                        }}
                        style={[styles.tab, activeTrimester === tri && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTrimester === tri && styles.activeTabText]}>
                            {tri} Trimester
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Card variant="gradient" gradientColors={theme.gradients.pregnancy} padding="lg" style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <View>
                            <Text style={styles.progressTitle}>{activeTrimester} Trimester Progress</Text>
                            <Text style={styles.progressSubtitle}>{completedCount} of {currentTasks.length} tasks completed</Text>
                        </View>
                        <ClipboardList color="white" size={32} opacity={0.8} />
                    </View>
                    <ProgressBar progress={progress} height={8} color="white" style={styles.progressBar} />
                </Card>

                <View style={styles.taskList}>
                    {currentTasks.map((task) => (
                        <TouchableOpacity
                            key={task.id}
                            activeOpacity={0.7}
                            onPress={() => toggleItem(task.id)}
                            style={styles.taskItem}
                        >
                            <View style={styles.taskIconWrapper}>
                                {checkedItems[task.id] ? (
                                    <CheckCircle2 size={24} color={theme.colors.primary[500]} />
                                ) : (
                                    <Circle size={24} color={theme.colors.gray[300]} />
                                )}
                            </View>
                            <View style={styles.taskContent}>
                                <Text style={[styles.taskText, checkedItems[task.id] && styles.taskTextCompleted]}>
                                    {task.task}
                                </Text>
                                <Badge variant="neutral" size="sm" style={styles.taskBadge}>
                                    {task.category}
                                </Badge>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: theme.colors.white,
        ...theme.shadows.sm,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    trimesterTabs: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
        backgroundColor: theme.colors.white,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: theme.colors.gray[50],
        borderWidth: 1,
        borderColor: theme.colors.gray[100],
    },
    activeTab: {
        backgroundColor: theme.colors.primary[50],
        borderColor: theme.colors.primary[200],
    },
    tabText: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.text.secondary,
    },
    activeTabText: {
        color: theme.colors.primary[600],
    },
    content: { flex: 1, padding: 20 },
    progressCard: {
        marginBottom: 24,
        borderRadius: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: 'white',
    },
    progressSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    progressBar: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    taskList: {
        gap: 12,
    },
    taskItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    taskIconWrapper: {
        marginRight: 16,
    },
    taskContent: {
        flex: 1,
    },
    taskText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    taskTextCompleted: {
        color: theme.colors.text.tertiary,
        textDecorationLine: 'line-through',
    },
    taskBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
});
