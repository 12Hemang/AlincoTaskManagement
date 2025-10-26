// screens/TaskEdit.tsx
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
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateTask, fetchTaskById } from '../slice/taskSlice';
import {
  fetchEmployees,
  assignEmployeeToTask,
  removeEmployeeFromTask,
  addAssignedEmployee,
  removeAssignedEmployee,
  fetchAssignedEmployees,
  fetchTaskToDos,
  Employee,
} from '../../employee/slice/employeeSlice';
import { fetchProjects, Project } from '../../project/slice/projectSlice';
import Dropdown from '../../../components/Dropdown';
import BottomDragSheet from '../../../components/BottomDragSheet';
import EmployeeSearchScreen from '../../employee/components/EmployeeSearch';

export default function TaskEdit({ navigation, route }: any) {
  const { taskId } = route.params || {};
  const dispatch = useAppDispatch();
  const { selectedTask: task, loading: taskLoading } = useAppSelector(state => state.task);
  const { assignedEmployees, todos } = useAppSelector(state => state.employee);
  const { projects, loading: projectsLoading } = useAppSelector(state => state.project);

  const [form, setForm] = useState({
    subject: '',
    description: '',
    project: '',
    status: 'Open',
    priority: 'Medium',
  });
  const [updating, setUpdating] = useState(false);
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);

  useEffect(() => {
    if (taskId) {
      dispatch(fetchTaskById(taskId));
      dispatch(fetchAssignedEmployees(taskId));
      dispatch(fetchTaskToDos(taskId));
    }
    dispatch(fetchProjects());
  }, [dispatch, taskId]);

  useEffect(() => {
    if (task) {
      setForm({
        subject: task.subject || '',
        description: task.description || '',
        project: task.project || '',
        status: task.status || 'Open',
        priority: task.priority || 'Medium',
      });
    }
  }, [task]);

  // Prepare project options for dropdown
  const projectOptions = [
    { label: 'Select a project...', value: '' },
    ...projects.map((project: Project) => ({
      label: project.project_name,
      value: project.name,
    })),
  ];

  // Status options
  const statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'Working', value: 'Working' },
    { label: 'Pending Review', value: 'Pending Review' },
    { label: 'Overdue', value: 'Overdue' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  // Priority options
  const priorityOptions = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
    { label: 'Urgent', value: 'Urgent' },
  ];

  const updateTaskHandler = async () => {
    if (!form.subject.trim()) {
      Alert.alert('Validation Error', 'Please enter a subject for the task');
      return;
    }

    setUpdating(true);
    try {
      const taskData = {
        subject: form.subject.trim(),
        description: form.description.trim(),
        project: form.project || undefined,
        status: form.status,
        priority: form.priority,
      };

      await dispatch(updateTask({ id: taskId, task: taskData })).unwrap();

      Alert.alert('Success', 'Task updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handleEmployeeSelect = async (employee: Employee) => {
    try {
      await dispatch(
        assignEmployeeToTask({
          taskId: taskId,
          employeeEmail: employee.value,
          description: `Work on: ${form.subject}`,
          priority: form.priority,
        })
      ).unwrap();

      // Refresh assigned employees list
      dispatch(fetchAssignedEmployees(taskId));
      dispatch(fetchTaskToDos(taskId));
      setEmployeeModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to assign employee');
    }
  };

  const handleRemoveEmployee = async (employee: Employee) => {
    try {
      await dispatch(
        removeEmployeeFromTask({
          taskId: taskId,
          employeeEmail: employee.value,
        })
      ).unwrap();

      // Refresh assigned employees list
      dispatch(fetchAssignedEmployees(taskId));
      dispatch(fetchTaskToDos(taskId));
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to remove employee');
    }
  };

  const handleCloseEmployeeSearch = () => {
    setEmployeeModalVisible(false);
  };

  const handleBackPress = () => {
    if (form.subject !== task?.subject ||
      form.description !== task?.description ||
      form.project !== task?.project ||
      form.status !== task?.status ||
      form.priority !== task?.priority) {
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

  const renderAssignedEmployee = ({ item }: { item: Employee }) => (
    <View style={styles.assignedEmployeeItem}>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.description}</Text>
        <Text style={styles.employeeEmail}>{item.value}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeEmployeeButton}
        onPress={() => handleRemoveEmployee(item)}
      >
        <Text style={styles.removeEmployeeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderToDoItem = ({ item }: { item: any }) => (
    <View style={styles.todoItem}>
      <View style={styles.todoInfo}>
        <Text style={styles.todoDescription}>{item.description}</Text>
        <View style={styles.todoMeta}>
          <Text style={[styles.todoStatus, getStatusStyle(item.status)]}>
            {item.status}
          </Text>
          <Text style={[styles.todoPriority, getPriorityStyle(item.priority)]}>
            {item.priority}
          </Text>
        </View>
      </View>
    </View>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open': return styles.statusOpen;
      case 'Working': return styles.statusWorking;
      case 'Pending Review': return styles.statusPending;
      case 'Overdue': return styles.statusOverdue;
      case 'Completed': return styles.statusCompleted;
      case 'Cancelled': return styles.statusCancelled;
      default: return styles.statusOpen;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Low': return styles.priorityLow;
      case 'Medium': return styles.priorityMedium;
      case 'High': return styles.priorityHigh;
      case 'Urgent': return styles.priorityUrgent;
      default: return styles.priorityMedium;
    }
  };

  const isFormValid = form.subject.trim().length > 0;

  if (taskLoading && !task) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading task...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Task</Text>
          <Text style={styles.headerSubtitle}>Update task details</Text>
        </View>
      </View>

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
            <Dropdown
              label=""
              selectedValue={form.project}
              onValueChange={(value) => setForm({ ...form, project: value })}
              options={projectOptions}
            />
            {projectsLoading && (
              <Text style={styles.loadingText}>Loading projects...</Text>
            )}
          </View>

          {/* Status and Priority Row */}
          <View style={styles.row}>
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>Status</Text>
              <Dropdown
                label=""
                selectedValue={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
                options={statusOptions}
              />
            </View>

            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>Priority</Text>
              <Dropdown
                label=""
                selectedValue={form.priority}
                onValueChange={(value) => setForm({ ...form, priority: value })}
                options={priorityOptions}
              />
            </View>
          </View>

          {/* Assigned Employees Section */}
          <View style={styles.field}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Assigned Employees</Text>
              <TouchableOpacity
                style={styles.addEmployeeButton}
                onPress={() => setEmployeeModalVisible(true)}
              >
                <Text style={styles.addEmployeeText}>+ Add Employee</Text>
              </TouchableOpacity>
            </View>

            {assignedEmployees.length === 0 ? (
              <View style={styles.noEmployees}>
                <Text style={styles.noEmployeesText}>No employees assigned</Text>
                <Text style={styles.noEmployeesSubtext}>
                  Add employees who will work on this task
                </Text>
              </View>
            ) : (
              <View style={styles.assignedEmployeesList}>
                <FlatList
                  data={assignedEmployees}
                  renderItem={renderAssignedEmployee}
                  keyExtractor={(item) => item.value}
                  scrollEnabled={false}
                />
                <Text style={styles.assignedCount}>
                  {assignedEmployees.length} employee(s) assigned
                </Text>
              </View>
            )}
          </View>

          {/* ToDos Section */}
          {todos.data && todos.data.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Assignment Details</Text>
              <View style={styles.todosList}>
                <FlatList
                  data={todos.data}
                  renderItem={renderToDoItem}
                  keyExtractor={(item) => item.name}
                  scrollEnabled={false}
                />
              </View>
            </View>
          )}

          {/* Update Button */}
          <TouchableOpacity
            style={[
              styles.updateButton,
              (!isFormValid || updating) && styles.updateButtonDisabled
            ]}
            onPress={updateTaskHandler}
            disabled={!isFormValid || updating}
          >
            {updating ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.updateButtonText}>Updating Task...</Text>
              </View>
            ) : (
              <Text style={styles.updateButtonText}>Update Task</Text>
            )}
          </TouchableOpacity>

          {/* Form Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips:</Text>
            <Text style={styles.tipsText}>• Keep the subject clear and concise</Text>
            <Text style={styles.tipsText}>• Update description as task progresses</Text>
            <Text style={styles.tipsText}>• Change status to reflect current progress</Text>
            <Text style={styles.tipsText}>• Adjust priority based on urgency</Text>
            <Text style={styles.tipsText}>• Assign relevant team members</Text>
          </View>
        </View>
      </ScrollView>

      {/* Employee Search Bottom Sheet */}
      <BottomDragSheet
        visible={employeeModalVisible}
        onClose={handleCloseEmployeeSearch}
        title="Add Employee"
        subtitle="Search and select employees to assign"
        height={0.8}
        showDragHandle={true}
      >
        <EmployeeSearchScreen
          route={{
            params: {
              onEmployeeSelect: handleEmployeeSelect,
              title: "Add Employee",
              subtitle: "Search and select employees to assign",
              currentSelection: null
            }
          }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addEmployeeButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addEmployeeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  noEmployees: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  noEmployeesText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  noEmployeesSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  assignedEmployeesList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  assignedEmployeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  employeeEmail: {
    fontSize: 12,
    color: '#666',
  },
  removeEmployeeButton: {
    padding: 4,
  },
  removeEmployeeText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
  },
  assignedCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  todosList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  todoInfo: {
    flex: 1,
  },
  todoDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  todoMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  todoStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todoPriority: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusOpen: { backgroundColor: '#E3F2FD', color: '#1976D2' },
  statusWorking: { backgroundColor: '#FFF3E0', color: '#F57C00' },
  statusPending: { backgroundColor: '#FFF8E1', color: '#FFA000' },
  statusOverdue: { backgroundColor: '#FFEBEE', color: '#D32F2F' },
  statusCompleted: { backgroundColor: '#E8F5E8', color: '#388E3C' },
  statusCancelled: { backgroundColor: '#F5F5F5', color: '#757575' },
  priorityLow: { backgroundColor: '#E8F5E8', color: '#388E3C' },
  priorityMedium: { backgroundColor: '#FFF3E0', color: '#F57C00' },
  priorityHigh: { backgroundColor: '#FFEBEE', color: '#D32F2F' },
  priorityUrgent: { backgroundColor: '#FCE4EC', color: '#C2185B' },
  updateButton: {
    backgroundColor: '#4CAF50',
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
  updateButtonDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateButtonText: {
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
  loadingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 4,
  },
});