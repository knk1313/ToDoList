import { useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function DetailScreen({ route }) {
  const { todo, onSave } = route.params;

  const [title, setTitle] = useState(todo.title);
  const [note, setNote] = useState(todo.note || "");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave({ ...todo, note });
    }
  };

  const handleBlurTitle = () => {
    setIsEditingTitle(false);
    handleSave();
  };

  const handleBlurNote = () => {
    setIsEditingNote(false);
    handleSave();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>タイトル(タップで編集)</Text>

          {isEditingTitle ? (
            <TextInput
              style={[styles.title, styles.input]}
              value={title}
              onChangeText={setTitle}
              placeholder="タイトルを入力"
              autoFocus
              onBlur={handleBlurTitle}
            />
          ) : (
            <TouchableWithoutFeedback onPress={() => setIsEditingTitle(true)}>
              <View>
                <Text style={title ? styles.title : styles.placeholder}>
                  {title || "タイトルを追加"}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          )}

          <Text style={styles.createdAt}>
            作成: {new Date(todo.createdAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>メモ(タップで編集)</Text>
          {isEditingNote ? (
            <TextInput
              style={[styles.paragraph, styles.input]}
              value={note}
              onChangeText={setNote}
              placeholder="メモを入力"
              multiline
              autoFocus
              onBlur={handleBlurNote}
            />
          ) : (
            <TouchableWithoutFeedback onPress={() => setIsEditingNote(true)}>
              <View>
                <Text style={note ? styles.paragraph : styles.placeholder}>
                  {note || "メモを追加"}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 16,
  },
  label: { fontSize: 12, color: "#666", marginBottom: 6 },
  title: { fontSize: 20, fontWeight: "700" },
  createdAt: { marginTop: 8, fontSize: 12, color: "#666" },
  paragraph: { marginTop: 8, lineHeight: 20, fontSize: 14, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    minHeight: 100,
    textAlignVertical: "top",
  },
  placeholder: {
    fontSize: 14,
    color: "#aaa",
    fontStyle: "italic",
    marginTop: 8,
  },
});
