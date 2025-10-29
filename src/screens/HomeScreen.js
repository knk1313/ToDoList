import DateTimePicker from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import {
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import TodoItem from "../components/TodoItem";

export default function HomeScreen({ navigation }) {
  const [text, setText] = useState("");
  const [dueAt, setDueAt] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [todos, setTodos] = useState([
    {
      id: String(Date.now()),
      title: "サンプル",
      createdAt: new Date().toISOString(),
      done: false,
    },
  ]);

  const canAdd = useMemo(() => text.trim().length > 0, [text]);

  const addTodo = () => {
    if (!canAdd) return;
    const newTodo = {
      id: String(Date.now()),
      title: text.trim(),
      createdAt: new Date().toISOString(),
      dueAt: dueAt ? dueAt.toISOString() : null,
      done: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
    setText("");
    setDueAt(null);
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const updateDueDate = (id, newDueAt) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dueAt: newDueAt } : t))
    );
  };

  const openDetail = (item) => {
    navigation.navigate("Detail", {
      todo: item,
      onSave: (updated) =>
        setTodos((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        ),
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="やることを入力"
            value={text}
            onChangeText={setText}
            onSubmitEditing={addTodo}
            returnKeyType="done"
          />
          <Button title="追加" onPress={addTodo} disabled={!canAdd} />
        </View>

        <View style={styles.row}>
          <Button
            title={dueAt ? "期限を変更" : "期限を選ぶ"}
            onPress={() => setShowPicker(true)}
          />
          <View style={{ flex: 1 }} />
          {dueAt ? (
            <View style={styles.dueBadge}>
              <View>
                <Button title="✕ クリア" onPress={() => setDueAt(null)} />
              </View>
            </View>
          ) : null}
        </View>

        {dueAt ? (
          <View style={{ marginBottom: 12 }}>
            <TextInput
              editable={false}
              value={`期限: ${dueAt.toLocaleString()}`}
              style={[styles.input, { color: "#333" }]}
            />
          </View>
        ) : null}

        {showPicker && (
          <DateTimePicker
            value={dueAt || new Date()}
            mode="datetime"
            display={Platform.OS === "ios" ? "default" : "default"}
            themeVariant="light"
            onChange={(event, date) => {
              if (Platform.OS === "android") setShowPicker(false);
              if (Platform.OS === "ios") setShowPicker(false);
              if (date) setDueAt(date);
            }}
            onTouchCancel={() => setShowPicker(false)}
          />
        )}

        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TodoItem
              item={item}
              onPress={() => openDetail(item)}
              onDelete={() => deleteTodo(item.id)}
              onToggle={() => toggleTodo(item.id)}
              onUpdateDue={updateDueDate}
            />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  metaText: { fontSize: 12, color: "#666" },
  linkBtn: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  separator: { height: 8 },
});
