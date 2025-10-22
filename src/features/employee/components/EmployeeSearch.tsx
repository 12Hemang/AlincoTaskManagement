import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Employee, fetchEmployees, searchEmployees } from '../slice/employeeSlice';


interface EmployeeSearchProps {
  visible: boolean;
  onClose: () => void;
  onEmployeeSelect: (employee: Employee) => void;
  assignedEmployees?: string[];
}

const EmployeeSearch: React.FC<EmployeeSearchProps> = ({
  visible,
  onClose,
  onEmployeeSelect,
  assignedEmployees = []
}) => {
  const dispatch = useAppDispatch();
  const { employees, loading } = useAppSelector(state => state.employee);
  
  const [searchText, setSearchText] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      // Load all employees when modal opens
      dispatch(fetchEmployees());
    }
  }, [visible, dispatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for search
    if (text.trim().length > 0) {
      const timeout = setTimeout(() => {
        dispatch(searchEmployees(text.trim()));
      }, 300);
      setSearchTimeout(timeout);
    } else {
      // If search text is empty, load all employees
      dispatch(fetchEmployees());
    }
  }, [searchTimeout, dispatch]);

  const isEmployeeAssigned = (employeeName: string) => {
    return assignedEmployees.includes(employeeName);
  };

  const handleEmployeeSelect = (employee: Employee) => {
    if (isEmployeeAssigned(employee.name)) {
      Alert.alert(
        'Already Assigned',
        `${employee.employee_name} is already assigned to this task.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    onEmployeeSelect(employee);
    onClose();
    setSearchText('');
  };

  const renderEmployeeItem = ({ item }: { item: Employee }) => (
    <TouchableOpacity
      style={[
        styles.employeeItem,
        isEmployeeAssigned(item.name) && styles.employeeItemAssigned
      ]}
      onPress={() => handleEmployeeSelect(item)}
      disabled={isEmployeeAssigned(item.name)}
    >
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.employee_name}</Text>
        <Text style={styles.employeeDetails}>
          {item.designation} • {item.department}
        </Text>
        {item.email && (
          <Text style={styles.employeeEmail}>{item.email}</Text>
        )}
      </View>
      <View style={styles.employeeStatus}>
        {isEmployeeAssigned(item.name) ? (
          <Text style={styles.assignedText}>Assigned</Text>
        ) : (
          <Text style={styles.selectText}>Select</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Assign Employee</Text>
            <Text style={styles.headerSubtitle}>Search and select an employee</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees by name..."
            value={searchText}
            onChangeText={handleSearch}
            autoFocus
          />
          {loading && (
            <ActivityIndicator size="small" color="#2196F3" style={styles.searchLoader} />
          )}
        </View>

        {/* Results */}
        <FlatList
          data={employees}
          keyExtractor={(item) => item.name}
          renderItem={renderEmployeeItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {searchText ? 'No employees found' : 'No employees available'}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchText ? 'Try a different search term' : 'Check if employees exist in the system'}
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loading ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.loadingText}>Searching employees...</Text>
              </View>
            ) : null
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchLoader: {
    position: 'absolute',
    right: 28,
    top: 28,
  },
  listContent: {
    padding: 16,
  },
  employeeItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  employeeItemAssigned: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
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
  employeeEmail: {
    fontSize: 11,
    color: '#999',
  },
  employeeStatus: {
    marginLeft: 12,
  },
  assignedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  selectText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});

export default EmployeeSearch;