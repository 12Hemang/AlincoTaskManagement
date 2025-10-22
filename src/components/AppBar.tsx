// components/AppBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { CommonStyles } from '../utils/commonStyles';


interface AppBarProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

const AppBar: React.FC<AppBarProps> = ({
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  rightComponent,
}) => {
  return (
    <>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <View style={[
        CommonStyles.appBar, CommonStyles.appBarWithBack
      ]}>
        {showBackButton && (
          <TouchableOpacity 
            style={CommonStyles.backButton}
            onPress={onBackPress}
          >
            <Text style={CommonStyles.backArrow}>‹</Text>
          </TouchableOpacity>
        )}
        
        <View style={CommonStyles.appBarContent}>
          <Text style={CommonStyles.appBarTitle}>{title}</Text>
          {subtitle && <Text style={CommonStyles.appBarSubtitle}>{subtitle}</Text>}
        </View>

        {rightComponent && rightComponent}
      </View>
    </>
  );
};

export default AppBar;