import * as DocumentPicker from 'expo-document-picker';
import { StatusBar } from 'expo-status-bar';
import {
    CheckCircle2,
    ChevronRight,
    Clock,
    FilePlus,
    FileText,
    Plus,
    User,
    X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../src/lib/api';

const { width } = Dimensions.get('window');

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

const REPORT_TYPES = [
    { label: 'Ultrasound', value: 'ULTRASOUND', icon: '👶' },
    { label: 'Blood Test', value: 'BLOOD_TEST', icon: '🩸' },
    { label: 'Lab Result', value: 'LAB_RESULT', icon: '🔬' },
    { label: 'Urine Test', value: 'URINE_TEST', icon: '🧪' },
    { label: 'Prescription', value: 'PRESCRIPTION', icon: '💊' },
    { label: 'Doctor Notes', value: 'DOCTOR_NOTES', icon: '📝' },
    { label: 'Other', value: 'OTHER', icon: '📄' },
];

const CATEGORY_COLORS: Record<string, string> = {
    ULTRASOUND: '#EEF2FF', // Light Indigo
    BLOOD_TEST: '#FFF1F2', // Light Rose
    LAB_RESULT: '#F0F9FF', // Light Sky
    URINE_TEST: '#F0FDF4', // Light Green
    PRESCRIPTION: '#FAF5FF', // Light Purple
    DOCTOR_NOTES: '#FEFCE8', // Light Yellow
    OTHER: '#F8FAFC', // Slate
};

const CATEGORY_TINT: Record<string, string> = {
    ULTRASOUND: '#4F46E5',
    BLOOD_TEST: '#E11D48',
    LAB_RESULT: '#0284C7',
    URINE_TEST: '#16A34A',
    PRESCRIPTION: '#9333EA',
    DOCTOR_NOTES: '#CA8A04',
    OTHER: '#475569',
};

import { useAuth } from '../../src/context/AuthContext';

export default function ReportsScreen() {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string | null>(null);

    // Upload Modal State
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [pickedFile, setPickedFile] = useState<any>(null);
    const [newReport, setNewReport] = useState({
        title: '',
        type: 'OTHER',
        description: '',
        doctorName: '',
        date: new Date().toISOString(),
    });

    const fetchReports = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
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
    }, [user]);

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                setPickedFile(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    const handleUpload = async () => {
        if (!pickedFile) {
            Alert.alert('Error', 'Please select a file first');
            return;
        }
        if (!newReport.title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        try {
            setUploading(true);

            // 1. Prepare Form Data for Proxy Upload
            const formData = new FormData();
            // @ts-ignore - FormData expects name/uri/type properties for files in React Native
            formData.append('file', {
                uri: pickedFile.uri,
                name: pickedFile.name,
                type: pickedFile.mimeType || pickedFile.type || 'application/octet-stream',
            });

            console.log('[Reports] Uploading file to proxy...');
            const uploadRes = await api.post('/mobile-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (!uploadRes.data.success) throw new Error('Upload proxy failed');

            const { fileUrl, fileName, fileSize, mimeType } = uploadRes.data;

            // 2. Create the Report record
            console.log('[Reports] Creating record in database...');
            await api.post('/reports', {
                title: newReport.title,
                type: newReport.type,
                category: 'OTHER', // Default to 'OTHER' to avoid enum mismatch
                description: newReport.description,
                doctorName: newReport.doctorName,
                reportDate: newReport.date,
                fileUrl,
                fileName,
                fileSize,
                mimeType,
            });

            Alert.alert('Success', 'Report uploaded successfully!');
            setIsUploadModalVisible(false);
            setPickedFile(null);
            setNewReport({
                title: '',
                type: 'OTHER',
                description: '',
                doctorName: '',
                date: new Date().toISOString(),
            });
            fetchReports();
        } catch (error: any) {
            console.error('[Reports] Upload Error:', error.response?.data || error.message);
            const errorDetail = error.response?.data?.details || error.response?.data?.message || error.message;
            Alert.alert('Upload Failed', `${error.response?.data?.error || 'Failed to upload report'}\n\nDetails: ${errorDetail}`);
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const categories = Array.from(new Set(reports.map(r => r.category || r.type).filter(Boolean)));

    const filteredReports = filter
        ? reports.filter(r => (r.category || r.type) === filter)
        : reports;

    const getIconForType = (type: string) => {
        switch (type) {
            case 'PRESCRIPTION': return <FileText size={20} color={CATEGORY_TINT[type]} />;
            case 'BLOOD_TEST': return <FileText size={20} color={CATEGORY_TINT[type]} />;
            case 'ULTRASOUND': return <FileText size={20} color={CATEGORY_TINT[type]} />;
            case 'LAB_RESULT': return <FileText size={20} color={CATEGORY_TINT[type]} />;
            case 'URINE_TEST': return <FileText size={20} color={CATEGORY_TINT[type]} />;
            default: return <FileText size={20} color="#64748B" />;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerTitle}>Medical Reports</Text>
                        <Text style={styles.headerSubtitle}>Your health record archive</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => setIsUploadModalVisible(true)}
                    >
                        <Plus size={20} color="white" />
                        <Text style={styles.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                {categories.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={{ paddingBottom: 4 }}>
                        <TouchableOpacity
                            style={[styles.filterTab, !filter && styles.activeFilterTab]}
                            onPress={() => setFilter(null)}
                        >
                            <Text style={[styles.filterTabText, !filter && styles.activeFilterTabText]}>All Reports</Text>
                        </TouchableOpacity>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.filterTab, filter === cat && styles.activeFilterTab]}
                                onPress={() => setFilter(cat!)}
                            >
                                <Text style={[styles.filterTabText, filter === cat && styles.activeFilterTabText]}>
                                    {cat?.replace('_', ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading && reports.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3A86FF" />
                        <Text style={styles.loadingText}>Fetching your records...</Text>
                    </View>
                ) : filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                        <TouchableOpacity
                            key={report.id}
                            style={styles.reportCard}
                            onPress={() => Alert.alert(report.title, `Type: ${report.type}\nDoctor: ${report.doctorName || 'N/A'}\nDate: ${formatDate(report.reportDate || report.createdAt)}`)}
                        >
                            <View style={[styles.reportIcon, { backgroundColor: CATEGORY_COLORS[report.type] || '#F8FAFC' }]}>
                                {getIconForType(report.type)}
                            </View>
                            <View style={styles.reportInfo}>
                                <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                                <View style={styles.reportMeta}>
                                    <View style={styles.metaItem}>
                                        <Clock size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                                        <Text style={styles.reportDate}>{formatDate(report.reportDate || report.createdAt)}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <View style={[styles.dot, { backgroundColor: CATEGORY_TINT[report.type] || '#94A3B8' }]} />
                                        <Text style={styles.reportCategory}>{report.category?.replace('_', ' ') || report.type.replace('_', ' ')}</Text>
                                    </View>
                                </View>
                                {report.doctorName && (
                                    <View style={styles.doctorItem}>
                                        <User size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                                        <Text style={styles.reportDoctor}>Dr. {report.doctorName}</Text>
                                    </View>
                                )}
                            </View>
                            <ChevronRight size={20} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <FilePlus size={48} color="#3A86FF" />
                        </View>
                        <Text style={styles.emptyTitle}>No Reports Yet</Text>
                        <Text style={styles.emptyText}>Keep your medical history organized. Upload your latest ultrasound, lab results, or prescriptions here.</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => setIsUploadModalVisible(true)}
                        >
                            <Text style={styles.emptyButtonText}>Upload First Report</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Upload Modal */}
            <Modal
                visible={isUploadModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsUploadModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalIndicator} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Upload Report</Text>
                            <TouchableOpacity
                                style={styles.closeButtonContainer}
                                onPress={() => setIsUploadModalVisible(false)}
                            >
                                <X size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Report Title</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 12 Week Anatomy Scan"
                                    value={newReport.title}
                                    onChangeText={(text) => setNewReport({ ...newReport, title: text })}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Category</Text>
                                <View style={styles.typeGrid}>
                                    {REPORT_TYPES.map((type) => (
                                        <TouchableOpacity
                                            key={type.value}
                                            style={[
                                                styles.typeItem,
                                                newReport.type === type.value && styles.activeTypeItem
                                            ]}
                                            onPress={() => setNewReport({ ...newReport, type: type.value })}
                                        >
                                            <Text style={styles.typeIcon}>{type.icon}</Text>
                                            <Text style={[
                                                styles.typeText,
                                                newReport.type === type.value && styles.activeTypeText
                                            ]}>
                                                {type.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Doctor Name (Optional)</Text>
                                <View style={styles.inputWithIcon}>
                                    <User size={18} color="#94A3B8" style={styles.fieldIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Dr. Sarah Johnson"
                                        value={newReport.doctorName}
                                        onChangeText={(text) => setNewReport({ ...newReport, doctorName: text })}
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Select Document</Text>
                                <TouchableOpacity
                                    style={[styles.filePicker, pickedFile && styles.filePicked]}
                                    onPress={pickFile}
                                >
                                    <View style={[styles.filePickerIcon, pickedFile && styles.filePickedIcon]}>
                                        {pickedFile ? <CheckCircle2 size={24} color="#10B981" /> : <FilePlus size={24} color="#3A86FF" />}
                                    </View>
                                    <View style={styles.filePickerInfo}>
                                        <Text style={[styles.filePickerText, pickedFile && styles.filePickedText]}>
                                            {pickedFile ? pickedFile.name : 'Choose PDF or Image'}
                                        </Text>
                                        {pickedFile ? (
                                            <Text style={styles.fileSize}>
                                                {(pickedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </Text>
                                        ) : (
                                            <Text style={styles.filePickerSubtext}>Max 10MB</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setIsUploadModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.submitButton,
                                        (!pickedFile || !newReport.title || uploading) && styles.submitButtonDisabled
                                    ]}
                                    onPress={handleUpload}
                                    disabled={!pickedFile || !newReport.title || uploading}
                                >
                                    {uploading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Upload Now</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F6FC', // Soft Blue Mist
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
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
    },
    uploadButton: {
        backgroundColor: '#3A86FF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        shadowColor: '#3A86FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    uploadButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
        marginLeft: 6,
    },
    filterContainer: {
        marginTop: 4,
    },
    filterTab: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        marginRight: 10,
    },
    activeFilterTab: {
        backgroundColor: '#3A86FF',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    activeFilterTabText: {
        color: 'white',
    },
    scrollContent: {
        padding: 24,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    loadingText: {
        marginTop: 12,
        color: '#64748B',
        fontSize: 14,
        fontWeight: '500',
    },
    reportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    reportIcon: {
        width: 54,
        height: 54,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reportInfo: {
        flex: 1,
        marginLeft: 16,
        marginRight: 8,
    },
    reportTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 6,
    },
    reportMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    reportCategory: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
    },
    reportDate: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '500',
    },
    doctorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    reportDoctor: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '500',
    },
    emptyContainer: {
        paddingTop: 60,
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: 'white',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#3A86FF',
    },
    emptyButtonText: {
        color: '#3A86FF',
        fontWeight: '700',
        fontSize: 15,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 24,
        maxHeight: '92%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    modalIndicator: {
        width: 40,
        height: 5,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1E293B',
    },
    closeButtonContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    formContent: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 10,
        marginLeft: 4,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        borderRadius: 18,
        paddingHorizontal: 16,
    },
    fieldIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        borderRadius: 18,
        padding: 16,
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '500',
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    typeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    activeTypeItem: {
        backgroundColor: '#EEF2FF',
        borderColor: '#3A86FF',
    },
    typeIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    typeText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    activeTypeText: {
        color: '#3A86FF',
        fontWeight: '700',
    },
    filePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 20,
        padding: 20,
    },
    filePicked: {
        borderColor: '#10B981',
        backgroundColor: '#F0FDF4',
        borderStyle: 'solid',
    },
    filePickerIcon: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    filePickedIcon: {
        backgroundColor: '#DCFCE7',
    },
    filePickerInfo: {
        flex: 1,
    },
    filePickerText: {
        fontSize: 15,
        color: '#1E293B',
        fontWeight: '700',
    },
    filePickerSubtext: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    filePickedText: {
        color: '#065F46',
    },
    fileSize: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '600',
        marginTop: 2,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
        marginBottom: 40,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#64748B',
        fontWeight: '700',
        fontSize: 16,
    },
    submitButton: {
        flex: 2,
        paddingVertical: 16,
        borderRadius: 18,
        backgroundColor: '#3A86FF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3A86FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    submitButtonDisabled: {
        backgroundColor: '#CBD5E1',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
    },
});
