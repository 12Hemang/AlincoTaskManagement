// screens/EmployeeSearchScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  clearSearchResults,
  Employee,
  searchEmployees,
} from '../slice/employeeSlice';
import { RootState } from '../../../app/store';

interface EmployeeSearchScreenProps {
  route?: {
    params?: {
      onEmployeeSelect?: (employee: Employee) => void;
      currentSelection?: Employee | null;
      title?: string;
      subtitle?: string;
    };
  };
}

const EmployeeSearchScreen: React.FC<EmployeeSearchScreenProps> = ({ route }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { data: employees, loading, error } = useSelector(
    (state: RootState) => state.employee.search
  );

  // Get parameters from navigation
  const {
    onEmployeeSelect,
    currentSelection = null,
    title = 'Select Employee',
    subtitle = 'Search and select an employee',
  } = route?.params || {};

  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search function
  const performSearch = useCallback(
    (text: string) => {
      if (text.length >= 2) {
        dispatch(searchEmployees(text) as any);
      } else if (text.length === 0) {
        dispatch(clearSearchResults());
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const handleEmployeeSelect = (employee: Employee) => {
    if (onEmployeeSelect) {
      onEmployeeSelect(employee);
    }
    //navigation.goBack();
  };

  const handleClose = () => {
    setSearchQuery('');
    dispatch(clearSearchResults());
    //navigation.goBack();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    dispatch(clearSearchResults());
  };

  const renderEmployeeItem = ({ item }: { item: Employee }) => (
    <TouchableOpacity
      style={[
        styles.employeeItem,
        currentSelection?.value === item.value && styles.selectedEmployeeItem
      ]}
      onPress={() => handleEmployeeSelect(item)}
    >
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>
          {item.description || item.value}
        </Text>
        <Text style={styles.employeeValue}>{item.value}</Text>
      </View>
      {currentSelection?.value === item.value && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedIndicatorText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery.length < 2
          ? 'Type at least 2 characters to search'
          : loading
            ? 'Searching employees...'
            : employees.length === 0 && searchQuery.length >= 2
              ? 'No employees found'
              : 'Search for employees by name or email'
        }
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#999"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSearch}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleClose}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      {/*{renderHeader()}*/}

      {/* Search Bar */}
      {renderSearchBar()}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Searching employees...</Text>
        </View>
      )}

      {/* Error Message */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {typeof error === 'string' ? error : 'Failed to search employees'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => performSearch(searchQuery)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Current Selection Display */}
      {currentSelection && !searchQuery && employees.length === 0 && (
        <View style={styles.currentSelectionContainer}>
          <Text style={styles.currentSelectionLabel}>Currently selected:</Text>
          <View style={styles.currentSelection}>
            <Text style={styles.currentSelectionName}>
              {currentSelection.description || currentSelection.value}
            </Text>
            <Text style={styles.currentSelectionValue}>
              {currentSelection.value}
            </Text>
          </View>
        </View>
      )}

      {/* Results List */}
      <FlatList
        data={employees}
        renderItem={renderEmployeeItem}
        keyExtractor={(item) => item.value}
        ListEmptyComponent={!loading && !error ? renderEmptyComponent : null}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#f8f9fa',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFE6E6',
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  currentSelectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  currentSelectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currentSelection: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  currentSelectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  currentSelectionValue: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  selectedEmployeeItem: {
    backgroundColor: '#e3f2fd',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  employeeValue: {
    fontSize: 14,
    color: '#666',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmployeeSearchScreen;