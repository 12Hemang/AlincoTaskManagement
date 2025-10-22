import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

type Attachment = {
  id: string;
  name: string;
  url: string;
};

type Props = {
  attachments: Attachment[];
  onAdd?: () => void;
  onEdit?: (attachment: Attachment) => void;
};

const AttachmentList: React.FC<Props> = ({ attachments, onAdd, onEdit }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attachments</Text>
        {onAdd && (
          <TouchableOpacity onPress={onAdd}>
            <Text style={styles.addBtn}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={attachments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => onEdit?.(item)}>
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No attachments</Text>}
      />
    </View>
  );
};

export default AttachmentList;

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  addBtn: {
    color: '#007bff',
    fontWeight: '600',
  },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  empty: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
