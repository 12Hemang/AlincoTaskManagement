import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { createTask as createTaskAPI } from '../slice/taskSlice';
import BottomDragSheet from '../../../components/BottomDragSheet';
import ProjectListScreen from '../../project/screens/ProjectListScreen';

export default function TaskCreate({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { loading: tasksLoading } = useAppSelector(state => state.task);
  
  const [form, setForm] = useState({
    subject: '',
    description: '',
    project: '',
    status: 'Open',
    priority: 'Medium',
  });

  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  const createTask = async () => {
    if (!form.subject.trim()) {
      Alert.alert('Validation Error', 'Please enter a subject for the task');
      return;
    }

    setCreating(true);
    try {
      await dispatch(createTaskAPI(form)).unwrap();
      Alert.alert('Success', 'Task created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create task. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleProjectSelect = (projectName: string) => {
    console.log('Project selected in TaskCreate:', projectName);
    setForm({ ...form, project: projectName });
    setProjectModalVisible(false);
  };

  const handleCloseProjectModal = () => {
    setProjectModalVisible(false);
  };

  const handleBackPress = () => {
    if (form.subject.trim() || form.description.trim() || form.project) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const isFormValid = form.subject.trim().length > 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Create New Task</Text>
          <Text style={styles.headerSubtitle}>Fill in the task details</Text>
        </View>
      </View>

      {/* Form Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Subject Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              value={form.subject}
              onChangeText={t => setForm({ ...form, subject: t })}
              style={[
                styles.input,
                !form.subject.trim() && styles.inputError
              ]}
              placeholder="Enter task subject"
              placeholderTextColor="#999"
              returnKeyType="next"
              maxLength={200}
            />
            {!form.subject.trim() && (
              <Text style={styles.errorText}>Subject is required</Text>
            )}
          </View>

          {/* Description Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              value={form.description}
              onChangeText={t => setForm({ ...form, description: t })}
              multiline
              style={[styles.input, styles.textArea]}
              placeholder="Enter task description"
              placeholderTextColor="#999"
              textAlignVertical="top"
              numberOfLines={4}
              maxLength={1000}
            />
            <Text style={styles.charCount}>
              {form.description.length}/1000
            </Text>
          </View>

          {/* Project Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Project</Text>
            <TouchableOpacity 
              style={[
                styles.projectSelector,
                form.project && styles.projectSelectorSelected
              ]}
              onPress={() => setProjectModalVisible(true)}
            >
              <View style={styles.projectSelectorContent}>
                <View style={styles.projectTextContainer}>
                  <Text style={form.project ? styles.projectSelected : styles.projectPlaceholder}>
                    {form.project || 'Select Project'}
                  </Text>
                  {form.project && (
                    <Text style={styles.projectSelectedSubtext}>Selected</Text>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
            
            {form.project && (
              <TouchableOpacity 
                style={styles.clearProjectButton}
                onPress={() => setForm({ ...form, project: '' })}
              >
                <Text style={styles.clearProjectText}>Clear Selection</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Status and Priority Row */}
          <View style={styles.row}>
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>Status</Text>
              <View style={[styles.input, styles.disabledInput]}>
                <Text style={styles.disabledText}>{form.status}</Text>
              </View>
            </View>

            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>Priority</Text>
              <View style={[styles.input, styles.disabledInput]}>
                <Text style={styles.disabledText}>{form.priority}</Text>
              </View>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity 
            style={[
              styles.createButton, 
              (!isFormValid || creating) && styles.createButtonDisabled
            ]}
            onPress={createTask}
            disabled={!isFormValid || creating}
          >
            {creating ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.createButtonText}>Creating Task...</Text>
              </View>
            ) : (
              <Text style={styles.createButtonText}>Create Task</Text>
            )}
          </TouchableOpacity>

          {/* Form Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips:</Text>
            <Text style={styles.tipsText}>• Provide a clear and concise subject</Text>
            <Text style={styles.tipsText}>• Add detailed description for better context</Text>
            <Text style={styles.tipsText}>• Assign to a project for better organization</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Drag Sheet for Project Selection */}
      <BottomDragSheet
        visible={projectModalVisible}
        onClose={handleCloseProjectModal}
        title="Select Project"
        subtitle="Choose a project for your task"
        height={0.7}
        showDragHandle={true}
      >
        <ProjectListScreen
          onSelect={handleProjectSelect}
          onClose={handleCloseProjectModal}
          showHeader={false}
          selectionMode={true}
        />
      </BottomDragSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backArrow: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 24,
  },
  field: {
    marginBottom: 24,
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
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  inputError: {
    borderColor: '#F44336',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    borderColor: '#E0E0E0',
  },
  disabledText: {
    color: '#666',
    fontSize: 16,
  },
  projectSelector: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  projectSelectorSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#F3F9FF',
  },
  projectSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  projectTextContainer: {
    flex: 1,
  },
  projectSelected: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  projectPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  projectSelectedSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  clearProjectButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearProjectText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDisabled: {
    backgroundColor: '#BBDEFB',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
    marginLeft: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 4,
    lineHeight: 16,
  },
});