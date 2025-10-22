// components/Drawer.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList, NavigationRoutes } from '../../../app/navigation/AppNavigator';
import { RootState } from '../../../app/store';
import { logoutUser } from '../../auth/slice/authSlice';

const { width } = Dimensions.get('window');

interface DrawerProps {
  drawerOpen: boolean;
  drawerAnim: Animated.Value;
  onClose: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ drawerOpen, drawerAnim, onClose }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    { 
      id: '1', 
      title: 'Dashboard', 
      icon: '📊',
      route: NavigationRoutes.Dashboard as keyof RootStackParamList
    },
    { 
      id: '2', 
      title: 'Projects', 
      icon: '📁',
      route: NavigationRoutes.ProjectListScreen as keyof RootStackParamList
    },
    { 
      id: '3', 
      title: 'Tasks', 
      icon: '✅',
      route: NavigationRoutes.TaskListScreen as keyof RootStackParamList
    },
    { 
      id: '4', 
      title: 'Create Task', 
      icon: '➕',
      route: NavigationRoutes.TaskCreate as keyof RootStackParamList
    },
    { 
      id: '5', 
      title: 'Reports', 
      icon: '📈',
      route: NavigationRoutes.Dashboard as keyof RootStackParamList // Replace with actual reports route
    },
  ];

  const handleNavigation = (route: keyof RootStackParamList) => {
    navigation.navigate(route as any);
    onClose();
  };

  const handleProfilePress = () => {
    navigation.navigate(NavigationRoutes.ProfileScreen);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser() as any);
      navigation.navigate(NavigationRoutes.Login);
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getPrimaryRole = (roles: any[]): string => {
    if (!roles || roles.length === 0) return 'User';
    return roles[0]?.role || 'User';
  };

  const formatLastLogin = (lastLogin: string): string => {
    if (!lastLogin) return 'Never';
    try {
      const date = new Date(lastLogin);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getUserInitials = (): string => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      {/* Overlay */}
      {drawerOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={onClose}
          activeOpacity={0.5}
        />
      )}

      {/* Drawer */}
      <Animated.View 
        style={[
          styles.drawer,
          {
            transform: [{ translateX: drawerAnim }],
          },
        ]}
      >
        {/* User Profile Section */}
        <TouchableOpacity 
          style={styles.userProfileSection}
          onPress={handleProfilePress}
        >
          <View style={styles.avatarContainer}>
            {user?.user_image ? (
              <Image 
                source={{ uri: user.user_image }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {getUserInitials()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.full_name || user?.first_name || 'User'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || 'No email'}
            </Text>
            <Text style={styles.userRole}>
              {getPrimaryRole(user?.roles || [])}
            </Text>
            {user?.last_login && (
              <Text style={styles.lastLogin}>
                Last login: {formatLastLogin(user.last_login)}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Navigation Menu */}
        <ScrollView style={styles.drawerContent}>
          {menuItems.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => handleNavigation(item.route)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Logout Section */}
        <View style={styles.drawerFooter}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>v1.0.0</Text>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: 'white',
    zIndex: 999,
    elevation: 5,
  },
  // User Profile Styles
  userProfileSection: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 2,
  },
  lastLogin: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  // Navigation Menu Styles
  drawerContent: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuIcon: {
    fontSize: 18,
    color: '#333',
    width: 24,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  // Footer Styles
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  logoutIcon: {
    fontSize: 18,
    color: '#f44336',
    width: 24,
  },
  logoutText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '600',
    marginLeft: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default Drawer;