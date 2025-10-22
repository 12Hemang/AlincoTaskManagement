import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchTasks } from '../slice/taskSlice';
import FloatingButton from '../../../components/FloatingButton';
import { CommonStyles } from '../../../utils/commonStyles';

type Props = any;

export default function TaskListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector(state => state.task);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchTasks()).unwrap();
    setRefreshing(false);
  }, [dispatch]);

  // Extract unique values for filters from tasks
  const filterOptions = useMemo(() => {
    const projects = ['all', ...new Set(tasks.map(task => task.project).filter(Boolean))] as string[];
    const statuses = ['all', ...new Set(tasks.map(task => task.status).filter(Boolean))] as string[];
    
    return { projects, statuses };
  }, [tasks]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const projectMatch = selectedProject === 'all' || task.project === selectedProject;
      const statusMatch = selectedStatus === 'all' || task.status === selectedStatus;
      return projectMatch && statusMatch;
    });

    // Sort by creation date
    filtered.sort((a, b) => {
      const dateA = new Date(a.creation).getTime();
      const dateB = new Date(b.creation).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [tasks, selectedProject, selectedStatus, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'in progress': return '#2196F3';
      case 'open': return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'on hold': return '#FF9800';
      default: return '#757575';
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSelectedProject('all');
    setSelectedStatus('all');
    setSortOrder('desc');
  };

  const hasActiveFilters = selectedProject !== 'all' || selectedStatus !== 'all' || sortOrder !== 'desc';

  const renderTaskItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={CommonStyles.card}
      onPress={() => navigation.navigate('TaskDetail', { taskName: item.name })}
    >
      {/* Task Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskSubject} numberOfLines={2}>
            {item.subject || 'Untitled Task'}
          </Text>
          <View style={styles.taskMeta}>
            <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
            {item.priority && (
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                • {item.priority}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      {/* Task Details */}
      <View style={styles.taskDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ID:</Text>
          <Text style={styles.detailValue}>{item.name}</Text>
        </View>
        
        {item.project && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Project:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.project}
            </Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>{formatDate(item.creation)}</Text>
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Progress if available */}
        {item.progress !== undefined && item.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(item.progress, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterSection = () => (
    <View style={styles.filterContainer}>
      {/* Filter Header */}
      <TouchableOpacity 
        style={styles.filterHeader}
        onPress={() => setShowFilters(!showFilters)}
      >
        <View style={styles.filterHeaderLeft}>
          <Text style={styles.filterTitle}>Filters</Text>
          {hasActiveFilters && (
            <View style={styles.activeFiltersBadge}>
              <Text style={styles.activeFiltersText}>Active</Text>
            </View>
          )}
        </View>
        <Text style={styles.filterToggle}>
          {showFilters ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* Expandable Filter Content */}
      {showFilters && (
        <View style={styles.filterContent}>
          {/* Project Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Project</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {filterOptions.projects.map(project => (
                <TouchableOpacity
                  key={project}
                  style={[
                    styles.filterPill,
                    selectedProject === project && styles.filterPillActive
                  ]}
                  onPress={() => setSelectedProject(project)}
                >
                  <Text style={[
                    styles.filterPillText,
                    selectedProject === project && styles.filterPillTextActive
                  ]}>
                    {project === 'all' ? 'All Projects' : project}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Status Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {filterOptions.statuses.map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterPill,
                    selectedStatus === status && styles.filterPillActive,
                    status !== 'all' && { borderLeftColor: getStatusColor(status), borderLeftWidth: 3 }
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[
                    styles.filterPillText,
                    selectedStatus === status && styles.filterPillTextActive
                  ]}>
                    {status === 'all' ? 'All Statuses' : status}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sort Order */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort by Date</Text>
            <View style={styles.sortContainer}>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortOrder === 'desc' && styles.sortButtonActive
                ]}
                onPress={() => setSortOrder('desc')}
              >
                <Text style={[
                  styles.sortButtonText,
                  sortOrder === 'desc' && styles.sortButtonTextActive
                ]}>
                  Newest First
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortOrder === 'asc' && styles.sortButtonActive
                ]}
                onPress={() => setSortOrder('asc')}
              >
                <Text style={[
                  styles.sortButtonText,
                  sortOrder === 'asc' && styles.sortButtonTextActive
                ]}>
                  Oldest First
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <Text style={styles.headerSubtitle}>Manage your tasks</Text>
      </View>

      {/* Filters Section */}
      {renderFilterSection()}

      <FlatList
        data={filteredAndSortedTasks}
        keyExtractor={item => item.name}
        renderItem={renderTaskItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing || loading} 
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {hasActiveFilters ? 'No tasks match your filters' : 'No tasks found'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {hasActiveFilters ? 'Try adjusting your filters' : 'Pull down to refresh or create a new task'}
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity 
                  style={styles.clearEmptyFiltersButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearEmptyFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && tasks.length > 0 ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.loadingText}>Loading more tasks...</Text>
            </View>
          ) : null
        }
      />

      <FloatingButton onPress={() => navigation.navigate('TaskCreate')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 12,
  },
  filterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activeFiltersBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeFiltersText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  filterToggle: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  filterContent: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  filterScrollContent: {
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterPillText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: 'white',
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: 'white',
  },
  clearFiltersButton: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  clearFiltersText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    fontSize: 10,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  chevron: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  taskDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 11,
    color: '#666',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    minWidth: 30,
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
    marginBottom: 16,
  },
  clearEmptyFiltersButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearEmptyFiltersText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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