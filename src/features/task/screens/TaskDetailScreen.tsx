import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { CommonStyles } from '../../../utils/commonStyles';
import EmployeeSearch from '../../employee/components/EmployeeSearch';
import { fetchEmployees, Employee } from '../../employee/slice/employeeSlice';
import { fetchTaskById, assignEmployeeToTask, removeEmployeeFromTask } from '../slice/taskSlice';

type Props = any;

// Safe helper function to handle assigned employees
const getAssignedEmployees = (taskDetail: any): string[] => {
  if (!taskDetail) return [];
  
  const assignedField = taskDetail.assigned;
  console.log('Assigned field:', assignedField);
  console.log('Type of assigned field:', typeof assignedField);
  
  // Handle all possible cases
  if (!assignedField) {
    return [];
  }
  
  if (Array.isArray(assignedField)) {
    return assignedField;
  }
  
  if (typeof assignedField === 'string') {
    return assignedField.split(',').map(emp => emp.trim()).filter(emp => emp);
  }
  
  // Fallback for any other type
  return [];
};

const TaskDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskName } = route.params;
  const dispatch = useAppDispatch();
  const { selectedTask: taskDetail, loading } = useAppSelector(state => state.task);
  const { employees } = useAppSelector(state => state.employee);
  
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState<string | null>(null);

  useEffect(() => {
    console.log('Fetching task detail for:', taskName);
    dispatch(fetchTaskById(taskName));
    dispatch(fetchEmployees());
  }, [taskName]);

  const assignedEmployeesList = () => {
    if (!taskDetail) return [];
    
    // Get assigned employee names as array using the safe helper
    const assignedEmployeeNames = getAssignedEmployees(taskDetail);
    
    console.log('Assigned employee names:', assignedEmployeeNames);
    console.log('Available employees:', employees);
    
    return employees.filter(emp => assignedEmployeeNames.includes(emp.name));
  };

  const handleAssignEmployee = async (employee: Employee) => {
    if (!taskDetail) return;
    
    setAssignmentLoading(employee.name);
    try {
      await dispatch(assignEmployeeToTask({
        taskId: taskDetail.name,
        employeeName: employee.name
      })).unwrap();
      
      Alert.alert('Success', `${employee.employee_name} assigned to task successfully!`);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to assign employee');
    } finally {
      setAssignmentLoading(null);
    }
  };

  const handleRemoveEmployee = async (employee: Employee) => {
    if (!taskDetail) return;
    
    Alert.alert(
      'Remove Employee',
      `Are you sure you want to remove ${employee.employee_name} from this task?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setAssignmentLoading(employee.name);
            try {
              await dispatch(removeEmployeeFromTask({
                taskId: taskDetail.name,
                employeeName: employee.name
              })).unwrap();
              
              Alert.alert('Success', `${employee.employee_name} removed from task successfully!`);
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

  const assignedEmployees = assignedEmployeesList();

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Details</Text>
        <Text style={styles.headerSubtitle}>{taskDetail.name}</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Task Information */}
        <View style={CommonStyles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          {renderField('Task ID', taskDetail.name)}
          {renderField('Subject', taskDetail.subject)}
          {renderField('Status', taskDetail.status)}
          {renderField('Priority', taskDetail.priority)}
          {renderField('Company', taskDetail.company)}
          {renderField('Owner', taskDetail.owner)}
          {renderField('Modified By', taskDetail.modified_by)}
          {renderField('Created On', taskDetail.creation)}
          {renderField('Modified On', taskDetail.modified)}
          {renderField('Progress', `${taskDetail.progress}%`)}
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
                Assign employees to this task for better tracking
              </Text>
            </View>
          ) : (
            <View style={styles.employeesList}>
              {assignedEmployees.map(employee => (
                <View key={employee.name} style={styles.employeeCard}>
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName}>{employee.employee_name}</Text>
                    <Text style={styles.employeeDetails}>
                      {employee.designation} • {employee.department}
                    </Text>
                    <Text style={styles.employeeCompany}>{employee.company}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveEmployee(employee)}
                    disabled={assignmentLoading === employee.name}
                  >
                    {assignmentLoading === employee.name ? (
                      <ActivityIndicator size="small" color="#F44336" />
                    ) : (
                      <Text style={styles.removeButtonText}>Remove</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Employee Search Modal */}
      <EmployeeSearch
        visible={showEmployeeSearch}
        onClose={() => setShowEmployeeSearch(false)}
        onEmployeeSelect={handleAssignEmployee}
        assignedEmployees={assignedEmployees.map(emp => emp.name)}
      />
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
    marginBottom: 20,
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
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  employeeDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  employeeCompany: {
    fontSize: 11,
    color: '#999',
  },
  removeButton: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
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