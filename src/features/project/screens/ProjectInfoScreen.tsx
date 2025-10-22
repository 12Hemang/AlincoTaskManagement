import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { createProject, updateProject, clearError } from '../slice/projectSlice';
import AppBar from '../../../components/AppBar';
import { CommonStyles } from '../../../utils/commonStyles';
import { Project } from '../slice/projectSlice';

interface ProjectInfoScreenProps {
    route?: any;
    navigation?: any;
    project?: Project; // For editing existing project
    onSave?: (project: Project) => void;
    onCancel?: () => void;
    mode?: 'create' | 'edit';
}

interface ProjectFormData {
    project_name: string;
    status: 'Open' | 'Completed' | 'Cancelled' | 'On Hold';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    project_type?: string;
    customer?: string;
    expected_start_date?: string;
    expected_end_date?: string;
    percent_complete?: number;
}

export default function ProjectInfoScreen({
    route,
    navigation,
    onSave,
    onCancel
}: ProjectInfoScreenProps) {
    const dispatch = useAppDispatch();
    const { mode = 'create', project } = route.params;
    const { loading, error } = useAppSelector(state => state.project);

    const [formData, setFormData] = useState<ProjectFormData>({
        project_name: '',
        status: 'Open',
        priority: 'Medium',
        project_type: '',
        customer: '',
        expected_start_date: '',
        expected_end_date: '',
        percent_complete: 0,
    });

    const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

    // Initialize form with project data if in edit mode
    useEffect(() => {
        console.log('Project data for editing:', project, mode, route.params);

        if (project && mode === 'edit') {
            setFormData({
                project_name: project.project_name || '',
                status: project.status || 'Open',
                priority: project.priority || 'Medium',
                project_type: project.project_type || '',
                customer: project.customer || '',
                expected_start_date: project.expected_start_date || '',
                expected_end_date: project.expected_end_date || '',
                percent_complete: project.percent_complete || 0,
            });
        }
    }, [project, mode]);

    // Handle errors
    useEffect(() => {
        if (error) {
            Alert.alert('Error', error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const validateForm = (): boolean => {
        const newErrors: Partial<ProjectFormData> = {};

        if (!formData.project_name.trim()) {
            newErrors.project_name = 'Project name is required';
        }

        if (formData.expected_start_date && formData.expected_end_date) {
            const startDate = new Date(formData.expected_start_date);
            const endDate = new Date(formData.expected_end_date);
            if (endDate < startDate) {
                newErrors.expected_end_date = 'End date cannot be before start date';
            }
        }

        if (formData.percent_complete !== undefined &&
            (formData.percent_complete < 0 || formData.percent_complete > 100)) {
            // newErrors.percent_complete = 'Progress must be between 0 and 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            if (mode === 'create') {
                const result = await dispatch(createProject(formData)).unwrap();
                onSave?.(result);
                navigation?.goBack?.();
                Alert.alert('Success', 'Project created successfully!');
            } else if (mode === 'edit' && project) {
                const result = await dispatch(updateProject({
                    id: project.name,
                    project: formData
                })).unwrap();
                onSave?.(result);
                navigation?.goBack?.();
                Alert.alert('Success', 'Project updated successfully!');
            }
        } catch (error) {
            // Error is handled by the slice and useEffect above
        }
    };

    const handleCancel = () => {
        onCancel?.();
        navigation?.goBack?.();
    };

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        return dateString.split(' ')[0]; // Remove time part if present
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return '#4CAF50';
            case 'in progress': return '#2196F3';
            case 'on hold': return '#FF9800';
            case 'cancelled': return '#F44336';
            case 'open': return '#9C27B0';
            default: return '#9E9E9E';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#F44336';
            case 'urgent': return '#D32F2F';
            case 'medium': return '#FF9800';
            case 'low': return '#4CAF50';
            default: return '#666';
        }
    };

    return (
        <View style={CommonStyles.container}>
            <AppBar
                title={mode === 'create' ? 'Create New Project' : 'Edit Project'}
                onBackPress={handleCancel}
                rightComponent={
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={CommonStyles.headerButtonText}>
                                {mode === 'create' ? 'Create' : 'Save'}
                            </Text>
                        )}
                    </TouchableOpacity>
                }
            />

            <ScrollView style={localStyles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={localStyles.form}>
                    {/* Project Name */}
                    <View style={localStyles.field}>
                        <Text style={localStyles.label}>Project Name *</Text>
                        <TextInput
                            style={[
                                localStyles.input,
                                errors.project_name && localStyles.inputError
                            ]}
                            value={formData.project_name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, project_name: text }))}
                            placeholder="Enter project name"
                            placeholderTextColor="#999"
                        />
                        {errors.project_name && (
                            <Text style={localStyles.errorText}>{errors.project_name}</Text>
                        )}
                    </View>

                    {/* Status */}
                    <View style={localStyles.field}>
                        <Text style={localStyles.label}>Status</Text>
                        <View style={localStyles.radioGroup}>
                            {['Open', 'In Progress', 'On Hold', 'Completed', 'Cancelled'].map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={localStyles.radioOption}
                                    onPress={() => setFormData(prev => ({ ...prev, status: status as ProjectFormData['status'] }))}
                                >
                                    <View style={[
                                        localStyles.radioCircle,
                                        { borderColor: getStatusColor(status) }
                                    ]}>
                                        {formData.status === status && (
                                            <View style={[
                                                localStyles.radioSelected,
                                                { backgroundColor: getStatusColor(status) }
                                            ]} />
                                        )}
                                    </View>
                                    <Text style={localStyles.radioText}>{status}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Priority */}
                    <View style={localStyles.field}>
                        <Text style={localStyles.label}>Priority</Text>
                        <View style={localStyles.radioGroup}>
                            {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                                <TouchableOpacity
                                    key={priority}
                                    style={localStyles.radioOption}
                                    onPress={() => setFormData(prev => ({ ...prev, priority: priority as ProjectFormData['priority'] }))}
                                >
                                    <View style={[
                                        localStyles.radioCircle,
                                        { borderColor: getPriorityColor(priority) }
                                    ]}>
                                        {formData.priority === priority && (
                                            <View style={[
                                                localStyles.radioSelected,
                                                { backgroundColor: getPriorityColor(priority) }
                                            ]} />
                                        )}
                                    </View>
                                    <Text style={localStyles.radioText}>{priority}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Progress */}
                    <View style={localStyles.field}>
                        <Text style={localStyles.label}>
                            Progress ({formData.percent_complete}%)
                        </Text>
                        <View style={localStyles.progressContainer}>
                            <View style={localStyles.progressBar}>
                                <View
                                    style={[
                                        localStyles.progressFill,
                                        { width: `${Math.min(formData.percent_complete || 0, 100)}%` }
                                    ]}
                                />
                            </View>
                            <TextInput
                                style={[
                                    localStyles.input,
                                    localStyles.progressInput,
                                    // errors.percent_complete && localStyles.inputError
                                ]}
                                value={formData.percent_complete?.toString() || '0'}
                                onChangeText={(text) => {
                                    const value = parseInt(text) || 0;
                                    setFormData(prev => ({ ...prev, percent_complete: Math.min(Math.max(value, 0), 100) }));
                                }}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#999"
                            />
                        </View>
                        {errors.percent_complete && (
                            <Text style={localStyles.errorText}>{errors.percent_complete}</Text>
                        )}
                    </View>

                    {/* Project Type */}
                    <View style={localStyles.field}>
                        <Text style={localStyles.label}>Project Type</Text>
                        <TextInput
                            style={localStyles.input}
                            value={formData.project_type}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, project_type: text }))}
                            placeholder="e.g., Internal, External, Client, Research"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Customer */}
                    <View style={localStyles.field}>
                        <Text style={localStyles.label}>Customer</Text>
                        <TextInput
                            style={localStyles.input}
                            value={formData.customer}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, customer: text }))}
                            placeholder="Customer name or organization"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Dates */}
                    <View style={localStyles.row}>
                        <View style={[localStyles.field, localStyles.halfField]}>
                            <Text style={localStyles.label}>Expected Start Date</Text>
                            <TextInput
                                style={localStyles.input}
                                value={formatDateForInput(formData.expected_start_date || '')}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, expected_start_date: text }))}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#999"
                            />
                            <Text style={localStyles.hintText}>Format: YYYY-MM-DD</Text>
                        </View>

                        <View style={[localStyles.field, localStyles.halfField]}>
                            <Text style={localStyles.label}>Expected End Date</Text>
                            <TextInput
                                style={[
                                    localStyles.input,
                                    errors.expected_end_date && localStyles.inputError
                                ]}
                                value={formatDateForInput(formData.expected_end_date || '')}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, expected_end_date: text }))}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#999"
                            />
                            {errors.expected_end_date ? (
                                <Text style={localStyles.errorText}>{errors.expected_end_date}</Text>
                            ) : (
                                <Text style={localStyles.hintText}>Format: YYYY-MM-DD</Text>
                            )}
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={localStyles.actions}>
                        <TouchableOpacity
                            style={[localStyles.button, localStyles.cancelButton]}
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            <Text style={localStyles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[localStyles.button, localStyles.saveButton]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={localStyles.saveButtonText}>
                                    {mode === 'create' ? 'Create Project' : 'Update Project'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const localStyles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    form: {
        padding: 16,
    },
    field: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfField: {
        flex: 0.48,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: '#ff3b30',
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 14,
        marginTop: 4,
    },
    hintText: {
        color: '#999',
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    radioText: {
        fontSize: 14,
        color: '#333',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#2196F3',
        borderRadius: 4,
    },
    progressInput: {
        width: 60,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    saveButton: {
        backgroundColor: '#2196F3',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});