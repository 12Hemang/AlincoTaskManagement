import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchProjects, clearSelectedProject, clearError } from '../slice/projectSlice';
import AppBar from '../../../components/AppBar';
import { CommonStyles } from '../../../utils/commonStyles';
import { NavigationRoutes } from '../../../app/navigation/AppNavigator';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProjectListScreenProps {
  route?: any;
  navigation?: any;
  onSelect?: (projectName: string) => void;
  onClose?: () => void;
  showHeader?: boolean;
  showAddButton?: boolean;
  selectionMode?: boolean;
}

export default function ProjectListScreen({ 
  route,
  navigation, 
  onSelect, 
  onClose, 
  showHeader = true,
  showAddButton = true,
  selectionMode = false 
}: ProjectListScreenProps) {
  const dispatch = useAppDispatch();
  const { projects, loading, error } = useAppSelector(state => state.project);
  const [refreshing, setRefreshing] = useState(false);

  // Debug props
  useEffect(() => {
    console.log('ProjectListScreen props:', {
      selectionMode,
      hasOnSelect: !!onSelect,
      hasOnClose: !!onClose,
      hasNavigation: !!navigation,
      routeParams: route?.params
    });
  }, [selectionMode, onSelect, onClose, navigation, route]);

  useEffect(() => {
    loadProjects();
    dispatch(clearSelectedProject());
  }, [dispatch]);

  useEffect(() => {
    if (error && !refreshing) {
      Alert.alert('Error', error, [
        { 
          text: 'OK', 
          onPress: () => dispatch(clearError()) 
        }
      ]);
    }
  }, [error, refreshing, dispatch]);

  const loadProjects = useCallback(async () => {
    try {
      await dispatch(fetchProjects()).unwrap();
    } catch (err) {
      console.log('Error loading projects:', err);
    }
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchProjects()).unwrap();
    } catch (err) {
      console.log('Error refreshing projects:', err);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleProjectSelect = useCallback((projectName: string) => {
    console.log('Project selected in ProjectListScreen:', projectName);
    console.log('Current mode:', selectionMode ? 'selection' : 'browse');
    
    if (selectionMode) {
      // For selection mode, use the callback props
      console.log('In selection mode, calling onSelect');
      if (onSelect) {
        onSelect(projectName);
      } else {
        console.warn('onSelect prop is not available in selection mode');
      }
      
      // Close the modal/sheet
      console.log('Closing modal/sheet');
      if (onClose) {
        onClose();
      } else if (navigation) {
        navigation.goBack();
      }
    } else {
      // For regular browsing mode, navigate to project detail
      console.log('In browse mode, navigating to project detail');
      if (navigation) {
        navigation.navigate(NavigationRoutes.ProjectDetail, { projectId: projectName });
      }
    }
  }, [selectionMode, onSelect, onClose, navigation]);

  const handleClose = () => {
    console.log('Closing ProjectListScreen');
    onClose?.();
    navigation?.goBack?.();
  };

  const handleAddProject = () => {
    navigation?.navigate?.(NavigationRoutes.ProjectInfoScreen, { mode: 'create' });
  };

  const handleEditProject = (project: any) => {
    navigation?.navigate?.(NavigationRoutes.ProjectInfoScreen, { 
      mode: 'edit', 
      project 
    });
  };

  const handleRetry = () => {
    loadProjects();
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

  const getProgressColor = (percent?: number) => {
    if (!percent) return '#9E9E9E';
    if (percent >= 100) return '#4CAF50';
    if (percent >= 75) return '#8BC34A';
    if (percent >= 50) return '#FFC107';
    if (percent >= 25) return '#FF9800';
    return '#F44336';
  };

  const renderProjectItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={CommonStyles.card}
      onPress={() => handleProjectSelect(item.name)}
      onLongPress={() => !selectionMode && handleEditProject(item)}
    >
      {/* Project Header */}
      <View style={localStyles.projectHeader}>
        <View style={localStyles.projectIcon}>
          <Text style={localStyles.projectIconText}>
            {getProjectIcon(item.project_type)}
          </Text>
        </View>
        <View style={localStyles.projectInfo}>
          <Text style={localStyles.projectName} numberOfLines={1}>
            {item.project_name || 'Unnamed Project'}
          </Text>
          <View style={localStyles.projectMeta}>
            <Text style={[localStyles.status, { backgroundColor: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
            {item.priority && (
              <Text style={[localStyles.priority, { color: getPriorityColor(item.priority) }]}>
                • {item.priority}
              </Text>
            )}
          </View>
        </View>
        <Text style={localStyles.chevron}>{selectionMode ? '✓' : '›'}</Text>
      </View>
      
      {/* Progress Bar */}
      {item.percent_complete !== undefined && (
        <View style={localStyles.progressContainer}>
          <View style={localStyles.progressBar}>
            <View 
              style={[
                localStyles.progressFill, 
                { 
                  width: `${Math.min(item.percent_complete, 100)}%`,
                  backgroundColor: getProgressColor(item.percent_complete)
                }
              ]} 
            />
          </View>
          <Text style={localStyles.progressText}>
            {item.percent_complete}% Complete
          </Text>
        </View>
      )}

      {/* Project Details */}
      <View style={localStyles.projectDetails}>
        <View style={localStyles.detailRow}>
          <Text style={localStyles.detailLabel}>ID:</Text>
          <Text style={localStyles.detailValue}>{item.name}</Text>
        </View>
        
        <View style={localStyles.detailRow}>
          <Text style={localStyles.detailLabel}>Type:</Text>
          <Text style={localStyles.detailValue}>{item.project_type || 'Not specified'}</Text>
        </View>
        
        <View style={localStyles.detailRow}>
          <Text style={localStyles.detailLabel}>Customer:</Text>
          <Text style={localStyles.detailValue}>{item.customer || 'Not specified'}</Text>
        </View>
        
        <View style={localStyles.detailRow}>
          <Text style={localStyles.detailLabel}>Created:</Text>
          <Text style={localStyles.detailValue}>{formatDate(item.creation)}</Text>
        </View>

        {/* Timeline */}
        {(item.expected_start_date || item.expected_end_date) && (
          <View style={localStyles.detailRow}>
            <Text style={localStyles.detailLabel}>Timeline:</Text>
            <Text style={localStyles.detailValue}>
              {item.expected_start_date ? formatDate(item.expected_start_date) : '?'}
              {' → '}
              {item.expected_end_date ? formatDate(item.expected_end_date) : '?'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const getProjectIcon = (projectType?: string) => {
    switch (projectType?.toLowerCase()) {
      case 'external': return '🌐';
      case 'internal': return '🏢';
      case 'client': return '👥';
      case 'research': return '🔬';
      case 'development': return '💻';
      default: return '📁';
    }
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

  const renderContent = () => {
    if (loading && projects.length === 0 && !refreshing) {
      return (
        <View style={[localStyles.stateContainer, { minHeight: SCREEN_HEIGHT * 0.4 }]}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={localStyles.stateText}>Loading projects...</Text>
        </View>
      );
    }

    if (error && projects.length === 0 && !refreshing) {
      return (
        <View style={[localStyles.stateContainer, { minHeight: SCREEN_HEIGHT * 0.4 }]}>
          <Text style={localStyles.stateIcon}>⚠️</Text>
          <Text style={localStyles.stateText}>Failed to load projects</Text>
          <Text style={localStyles.stateSubtext}>{error}</Text>
          <TouchableOpacity
            style={localStyles.retryButton}
            onPress={handleRetry}
          >
            <Text style={localStyles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (projects.length === 0 && !loading && !refreshing) {
      return (
        <View style={[localStyles.stateContainer, { minHeight: SCREEN_HEIGHT * 0.4 }]}>
          <Text style={localStyles.stateIcon}>📁</Text>
          <Text style={localStyles.stateText}>No projects found</Text>
          <Text style={localStyles.stateSubtext}>
            Get started by creating your first project
          </Text>
          {showAddButton && (
            <TouchableOpacity
              style={localStyles.addButton}
              onPress={handleAddProject}
            >
              <Text style={localStyles.addButtonText}>Create Project</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={projects}
        keyExtractor={item => item.name}
        renderItem={renderProjectItem}
        contentContainerStyle={[
          CommonStyles.scrollContent,
          { minHeight: SCREEN_HEIGHT * 0.4 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
      />
    );
  };

  return (
    <View style={CommonStyles.container}>
      {showHeader && (
        <AppBar
          title={selectionMode ? "Select Project" : "Projects"}
          subtitle={selectionMode ? "Choose a project for your task" : "Manage your projects"}
          onBackPress={handleClose}
          rightComponent={
            showAddButton && !selectionMode ? (
              <TouchableOpacity onPress={handleAddProject}>
                <Text style={CommonStyles.headerButtonText}>+</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      <View style={localStyles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  content: {
    flex: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectIconText: {
    fontSize: 18,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    fontSize: 10,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priority: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  projectDetails: {
    gap: 4,
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
  chevron: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  stateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  stateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  stateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});