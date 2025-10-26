// screens/TaskDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { CommonStyles } from '../../../utils/commonStyles';
import { fetchTaskById } from '../slice/taskSlice';
import {
  assignEmployeeToTask,
  removeEmployeeFromTask,
  fetchAssignedEmployees,
  Employee,
} from '../../employee/slice/employeeSlice';
import BottomDragSheet from '../../../components/BottomDragSheet';
import EmployeeSearchScreen from '../../employee/components/EmployeeSearch.tsx';

interface TaskDetailScreenProps {
  route: any;
  navigation: any;
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ route, navigation }) => {
  const { taskName } = route.params;
  const dispatch = useAppDispatch();
  const { selectedTask: taskDetail, loading } = useAppSelector((state) => state.task);
  const { assignedEmployees, todos } = useAppSelector((state) => state.employee);

  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState<string | null>(null);

  // Fetch task detail and assigned employees
  useEffect(() => {
    if (taskName) {
      dispatch(fetchTaskById(taskName));
      dispatch(fetchAssignedEmployees(taskName));
    }
  }, [taskName, dispatch]);

  // -------------------------
  // Assign Employee Handler
  // -------------------------
  const handleAssignEmployee = async (employee: Employee) => {
    if (!taskDetail) return;

    setAssignmentLoading(employee.value);
    try {
      await dispatch(
        assignEmployeeToTask({
          taskId: taskDetail.name,
          employeeEmail: employee.value,
          description: `Work on: ${taskDetail.subject}`,
          priority: taskDetail.priority || 'Medium',
        })
      ).unwrap();

      // Refresh assigned employees list
      await dispatch(fetchAssignedEmployees(taskDetail.name));

      setShowEmployeeSearch(false);
      Alert.alert('Success', `${employee.description} assigned to task successfully!`);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to assign employee');
    } finally {
      setAssignmentLoading(null);
    }
  };

  // -------------------------
  // Remove Employee Handler
  // -------------------------
  const handleRemoveEmployee = async (employee: Employee) => {
    if (!taskDetail) return;

    Alert.alert(
      'Remove Assignment',
      `Are you sure you want to remove ${employee.description} from this task?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setAssignmentLoading(employee.value);
            try {
              await dispatch(
                removeEmployeeFromTask({
                  taskId: taskDetail.name,
                  employeeEmail: employee.value,
                })
              ).unwrap();

              // Refresh assigned employees list
              await dispatch(fetchAssignedEmployees(taskDetail.name));

              Alert.alert('Success', `${employee.description} removed from task successfully!`);
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to remove employee');
            } finally {
              setAssignmentLoading(null);
            }
          },
        },
      ]
    );
  };

  // -------------------------
  // Close Employee Search
  // -------------------------
  const handleCloseEmployeeSearch = () => {
    setShowEmployeeSearch(false);
  };

  // -------------------------
  // Render Field Helper
  // -------------------------
  const renderField = (label: string, value?: string | number) => (
    <View style={styles.fieldContainer} key={label}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value?.toString() ?? ''}
        editable={false}
        multiline
        placeholderTextColor="#999"
      />
    </View>
  );

  // -------------------------
  // Render Assigned Employee Item
  // -------------------------
  const renderAssignedEmployee = (employee: Employee) => (
    <View key={employee.value} style={styles.employeeCard}>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{employee.description}</Text>
        <Text style={styles.employeeEmail}>{employee.value}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveEmployee(employee)}
        disabled={assignmentLoading === employee.value}
      >
        {assignmentLoading === employee.value ? (
          <ActivityIndicator size="small" color="#F44336" />
        ) : (
          <Text style={styles.removeButtonText}>Remove</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading || !taskDetail) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Details</Text>
        <Text style={styles.headerSubtitle}>{taskDetail.name}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Task Information */}
        <View style={CommonStyles.card}>
          <Text style={styles.sectionTitle}>Task Information</Text>
          {renderField('Subject', taskDetail.subject)}
          {renderField('Status', taskDetail.status)}
          {renderField('Priority', taskDetail.priority)}
          {renderField('Project', taskDetail.project)}
          {renderField('Owner', taskDetail.owner)}
          {renderField('Progress', taskDetail.progress ? `${taskDetail.progress}%` : '0%')}
          {taskDetail.description && renderField('Description', taskDetail.description)}
        </View>

        {/* Assigned Employees Section */}
        <View style={CommonStyles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assigned Employees</Text>
            <TouchableOpacity
              style={styles.assignButton}
              onPress={() => setShowEmployeeSearch(true)}
            >
              <Text style={styles.assignButtonText}>+ Assign</Text>
            </TouchableOpacity>
          </View>

          {assignedEmployees.length === 0 ? (
            <View style={styles.noEmployees}>
              <Text style={styles.noEmployeesText}>No employees assigned</Text>
              <Text style={styles.noEmployeesSubtext}>
                Assign employees to track their work on this task
              </Text>
            </View>
          ) : (
            <View style={styles.employeesList}>
              {assignedEmployees.map(renderAssignedEmployee)}
              <Text style={styles.assignmentCount}>
                {assignedEmployees.length} employee(s) assigned
              </Text>
            </View>
          )}
        </View>

        {/* ToDo Information */}
        {todos.data && todos.data.length > 0 && (
          <View style={CommonStyles.card}>
            <Text style={styles.sectionTitle}>Assignment Details</Text>
            <Text style={styles.todoInfo}>
              {todos.data.length} active assignment(s) via ToDo
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Employee Search Bottom Drag Sheet */}
      <BottomDragSheet
        visible={showEmployeeSearch}
        onClose={handleCloseEmployeeSearch}
        title="Assign Employee"
        subtitle="Search and select an employee to assign to this task"
        height={0.8}
        showDragHandle={true}
      >
        <EmployeeSearchScreen
          route={{
            params: {
              onEmployeeSelect: handleAssignEmployee,
              //title: "Assign Employee",
              //subtitle: "Search and select an employee to assign to this task"
            }
          }}
        />
      </BottomDragSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
    color: '#333',
    fontSize: 15,
    minHeight: 44,
  },
  assignButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  assignButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noEmployees: {
    alignItems: 'center',
    padding: 20,
  },
  noEmployeesText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  noEmployeesSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  employeesList: {
    gap: 12,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  employeeEmail: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
  },
  assignmentCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  todoInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default TaskDetailScreen;