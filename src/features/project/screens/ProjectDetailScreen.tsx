import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchProjectById, clearSelectedProject, deleteProject } from '../slice/projectSlice';
import AppBar from '../../../components/AppBar';
import { CommonStyles } from '../../../utils/commonStyles';
import { NavigationRoutes } from '../../../app/navigation/AppNavigator';

interface ProjectDetailScreenProps {
  route: any;
  navigation: any;
}

export default function ProjectDetailScreen({ route, navigation }: ProjectDetailScreenProps) {
  const { projectId } = route.params;
  const dispatch = useAppDispatch();
  const { selectedProject, loading, error } = useAppSelector(state => state.project);

  useEffect(() => {
    dispatch(fetchProjectById(projectId));

    return () => {
      dispatch(clearSelectedProject());
    };
  }, [dispatch, projectId]);

  const handleEdit = () => {
    if (selectedProject) {
      console.log('Navigating to edit project:', selectedProject, route.params);
      navigation.navigate(NavigationRoutes.ProjectInfoScreen, {
        mode: 'edit',
        project: selectedProject
      });
      // <NavigationRoutes.ProjectInfoScreen mode="edit" project={selectedProject} />
    }
  };

  const handleDelete = () => {
    if (!selectedProject) return;

    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${selectedProject.project_name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteProject(selectedProject.name)).unwrap();
              navigation.goBack();
              Alert.alert('Success', 'Project deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const getProgressColor = (percent?: number) => {
    if (!percent) return '#9E9E9E';
    if (percent >= 100) return '#4CAF50';
    if (percent >= 75) return '#8BC34A';
    if (percent >= 50) return '#FFC107';
    if (percent >= 25) return '#FF9800';
    return '#F44336';
  };

  if (loading && !selectedProject) {
    return (
      <View style={CommonStyles.container}>
        <AppBar title="Project Details" onBackPress={() => navigation.goBack()} />
        <View style={localStyles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={localStyles.loadingText}>Loading project details...</Text>
        </View>
      </View>
    );
  }

  if (!selectedProject) {
    return (
      <View style={CommonStyles.container}>
        <AppBar title="Project Details" onBackPress={() => navigation.goBack()} />
        <View style={localStyles.centerContainer}>
          <Text style={localStyles.errorText}>Project not found</Text>
          <TouchableOpacity
            style={localStyles.retryButton}
            onPress={() => dispatch(fetchProjectById(projectId))}
          >
            <Text style={localStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={CommonStyles.container}>
      <AppBar
        title="Project Details"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <View style={localStyles.headerActions}>
            <TouchableOpacity onPress={handleEdit}>
              <Text style={CommonStyles.headerButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={localStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={localStyles.content}>
          {/* Project Header */}
          <View style={localStyles.header}>
            <View style={localStyles.titleRow}>
              <Text style={localStyles.projectName}>
                {selectedProject.project_name || 'Unnamed Project'}
              </Text>
              <View style={[localStyles.statusBadge, { backgroundColor: getStatusColor(selectedProject.status) }]}>
                <Text style={localStyles.statusText}>{selectedProject.status}</Text>
              </View>
            </View>
            <Text style={localStyles.projectId}>ID: {selectedProject.name}</Text>
          </View>

          {/* Progress Section */}
          {selectedProject.percent_complete !== undefined && (
            <View style={localStyles.section}>
              <View style={localStyles.sectionHeader}>
                <Text style={localStyles.sectionTitle}>Progress</Text>
                <Text style={[localStyles.percentText, { color: getProgressColor(selectedProject.percent_complete) }]}>
                  {selectedProject.percent_complete}%
                </Text>
              </View>
              <View style={localStyles.progressBar}>
                <View 
                  style={[
                    localStyles.progressFill, 
                    { 
                      width: `${Math.min(selectedProject.percent_complete, 100)}%`,
                      backgroundColor: getProgressColor(selectedProject.percent_complete)
                    }
                  ]} 
                />
              </View>
            </View>
          )}

          {/* Basic Information */}
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Basic Information</Text>
            <View style={localStyles.detailGrid}>
              <View style={localStyles.detailItem}>
                <Text style={localStyles.detailLabel}>Status</Text>
                <View style={[localStyles.statusPill, { backgroundColor: getStatusColor(selectedProject.status) }]}>
                  <Text style={localStyles.statusPillText}>{selectedProject.status}</Text>
                </View>
              </View>
              
              <View style={localStyles.detailItem}>
                <Text style={localStyles.detailLabel}>Priority</Text>
                <Text style={[localStyles.detailValue, { color: getPriorityColor(selectedProject.priority) }]}>
                  {selectedProject.priority || 'Not set'}
                </Text>
              </View>
              
              <View style={localStyles.detailItem}>
                <Text style={localStyles.detailLabel}>Project Type</Text>
                <Text style={localStyles.detailValue}>{selectedProject.project_type || 'Not set'}</Text>
              </View>
              
              <View style={localStyles.detailItem}>
                <Text style={localStyles.detailLabel}>Customer</Text>
                <Text style={localStyles.detailValue}>{selectedProject.customer || 'Not set'}</Text>
              </View>
            </View>
          </View>

          {/* Timeline Information */}
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Timeline</Text>
            <View style={localStyles.detailList}>
              <View style={localStyles.detailRow}>
                <Text style={localStyles.detailLabel}>Created</Text>
                <Text style={localStyles.detailValue}>{formatDate(selectedProject.creation)}</Text>
              </View>
              
              <View style={localStyles.detailRow}>
                <Text style={localStyles.detailLabel}>Last Modified</Text>
                <Text style={localStyles.detailValue}>{formatDate(selectedProject.modified)}</Text>
              </View>
              
              {selectedProject.expected_start_date && (
                <View style={localStyles.detailRow}>
                  <Text style={localStyles.detailLabel}>Expected Start</Text>
                  <Text style={localStyles.detailValue}>{formatShortDate(selectedProject.expected_start_date)}</Text>
                </View>
              )}
              
              {selectedProject.expected_end_date && (
                <View style={localStyles.detailRow}>
                  <Text style={localStyles.detailLabel}>Expected End</Text>
                  <Text style={localStyles.detailValue}>{formatShortDate(selectedProject.expected_end_date)}</Text>
                </View>
              )}
              
              {selectedProject.actual_start_date && (
                <View style={localStyles.detailRow}>
                  <Text style={localStyles.detailLabel}>Actual Start</Text>
                  <Text style={localStyles.detailValue}>{formatShortDate(selectedProject.actual_start_date)}</Text>
                </View>
              )}
              
              {selectedProject.actual_end_date && (
                <View style={localStyles.detailRow}>
                  <Text style={localStyles.detailLabel}>Actual End</Text>
                  <Text style={localStyles.detailValue}>{formatShortDate(selectedProject.actual_end_date)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Ownership Information */}
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Ownership</Text>
            <View style={localStyles.detailList}>
              <View style={localStyles.detailRow}>
                <Text style={localStyles.detailLabel}>Owner</Text>
                <Text style={localStyles.detailValue}>{selectedProject.owner || 'Not set'}</Text>
              </View>
              
              <View style={localStyles.detailRow}>
                <Text style={localStyles.detailLabel}>Modified By</Text>
                <Text style={localStyles.detailValue}>{selectedProject.modified_by || selectedProject.owner || 'Not set'}</Text>
              </View>
              
              <View style={localStyles.detailRow}>
                <Text style={localStyles.detailLabel}>Company</Text>
                <Text style={localStyles.detailValue}>{ 'Not set'}</Text>
              </View>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Danger Zone</Text>
            <Text style={localStyles.dangerText}>
              Once you delete a project, there is no going back. Please be certain.
            </Text>
            <TouchableOpacity style={localStyles.deleteButton} onPress={handleDelete}>
              <Text style={localStyles.deleteButtonText}>Delete Project</Text>
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
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  projectId: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  percentText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: '48%',
    marginBottom: 8,
  },
  detailList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dangerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});