import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import TaskDetailScreen from '../../features/task/screens/TaskDetailScreen';
import TaskCreate from '../../features/task/screens/TaskCreate';
import DashboardScreen from '../../features/dashboard/Dashboard';
import ProjectListScreen from '../../features/project/screens/ProjectListScreen';
import TaskListScreen from '../../features/task/screens/TaskListScreen';
import ProfileScreen from '../../features/auth/screens/ProfileScreen';
import ProjectDetailScreen from '../../features/project/screens/ProjectDetailScreen';
import ProjectInfoScreen from '../../features/project/screens/ProjectInfoScreen';


// export type RootStackParamList = {
//   Login: undefined;
//   Dashboard: undefined; // dashboard contains drawer
//   TaskDetail: { taskName: string };
//   TaskCreate: undefined;
//   TaskListScreen: undefined;
//   ProfileScreen: undefined;
//   ProjectListScreen: { onSelect?: (projectName: string) => void; onClose?: () => void };
// };

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={NavigationRoutes.Login}  screenOptions={{
    headerShown: false,
  }}>
        <Stack.Screen name={NavigationRoutes.Login} component={LoginScreen} />
        <Stack.Screen name={NavigationRoutes.ProfileScreen} component={ProfileScreen} />
        <Stack.Screen
          name={NavigationRoutes.Dashboard}
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name={NavigationRoutes.TaskListScreen}   component={TaskListScreen} />
        <Stack.Screen name={NavigationRoutes.TaskDetail}   component={TaskDetailScreen} />
        <Stack.Screen name={NavigationRoutes.TaskCreate}   component={TaskCreate} />
        <Stack.Screen name={NavigationRoutes.ProjectListScreen}   component={ProjectListScreen} />
        <Stack.Screen name={NavigationRoutes.ProjectDetail} component={ProjectDetailScreen} />
        <Stack.Screen name={NavigationRoutes.ProjectInfoScreen} component={ProjectInfoScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}


export enum NavigationRoutes{
  Login = 'Login',
  Dashboard = 'Dashboard',
  TaskDetail ='TaskDetail',
  TaskListScreen ='TaskListScreen',
  TaskCreate = 'TaskCreate',
  ProjectListScreen = 'ProjectListScreen',
  ProfileScreen = 'ProfileScreen',
  ProjectDetail = 'ProjectDetail',
  ProjectInfoScreen = 'ProjectInfoScreen',
};

