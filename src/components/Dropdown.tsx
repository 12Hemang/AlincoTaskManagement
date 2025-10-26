// components/Dropdown.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  Dimensions,
  LayoutChangeEvent
} from 'react-native';

type Props = {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string; [key: string]: any }[];
  placeholder?: string;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Dropdown: React.FC<Props> = ({
                                     label,
                                     selectedValue,
                                     onValueChange,
                                     options,
                                     placeholder = "Select an option..."
                                   }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<View>(null);

  // Find the selected option for display
  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleTriggerLayout = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const spaceBelow = SCREEN_HEIGHT - y - height;
      const spaceAbove = y;

      // Position dropdown below the trigger with some margin
      const dropdownTop = y + height + 8;
      const dropdownLeft = x;
      const dropdownWidth = width;

      setDropdownPosition({
        top: dropdownTop,
        left: dropdownLeft,
        width: dropdownWidth
      });
    });
  };

  const handleOptionSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  const renderOptionItem = ({ item }: { item: { label: string; value: string } }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        item.value === selectedValue && styles.selectedOptionItem
      ]}
      onPress={() => handleOptionSelect(item.value)}
    >
      <Text style={[
        styles.optionText,
        item.value === selectedValue && styles.selectedOptionText
      ]}>
        {item.label}
      </Text>
      {item.value === selectedValue && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        ref={triggerRef}
        style={[
          styles.dropdownTrigger,
          !selectedValue && styles.placeholderStyle,
          modalVisible && styles.triggerFocused
        ]}
        onPress={() => setModalVisible(true)}
        onLayout={handleTriggerLayout}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedValue ? styles.placeholderText : styles.selectedText
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Text style={[
          styles.dropdownArrow,
          modalVisible && styles.dropdownArrowRotated
        ]}>▼</Text>
      </TouchableOpacity>

      {/* Custom Dropdown Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[
            styles.dropdownList,
            {
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight: SCREEN_HEIGHT - dropdownPosition.top - 20
            }
          ]}>
            <FlatList
              data={options}
              renderItem={renderOptionItem}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={true}
              bounces={false}
              style={styles.optionsList}
              contentContainerStyle={styles.optionsContent}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  triggerFocused: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  selectedText: {
    color: '#333',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    transform: [{ rotate: '0deg' }],
  },
  dropdownArrowRotated: {
    transform: [{ rotate: '180deg' }],
  },
  placeholderStyle: {
    borderColor: '#CCCCCC',
    backgroundColor: '#fafafa',
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  optionsList: {
    flex: 1,
  },
  optionsContent: {
    paddingVertical: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedOptionItem: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});