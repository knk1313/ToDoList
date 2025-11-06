import DateTimePicker from "@react-native-community/datetimepicker";
import { useLayoutEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import TodoItem from "../components/TodoItem";

export default function HomeScreen({ navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "ToDo リスト",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          style={{ paddingHorizontal: 12 }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#007AFF" }}>
            ＋
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const [text, setText] = useState("");
  const [dueAt, setDueAt] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [todos, setTodos] = useState([
    {
      id: "1",
      title: "ミーティング",
      createdAt: "2025-10-30T09:00:00.000+09:00",
      dueAt: "2025-10-30T10:00:00.000+09:00",
      done: false,
      tags: ["仕事", "重要"],
    },
    {
      id: "2",
      title: "買い物",
      createdAt: "2025-10-30T09:00:00.000+09:00",
      dueAt: "2025-10-30T20:00:00.000+09:00",
      done: false,
      tags: [],
    },
    {
      id: "3",
      title: "課題提出",
      createdAt: "2025-10-30T09:00:00.000+09:00",
      dueAt: "2025-11-02T18:00:00.000+09:00",
      done: false,
      tags: ["大学"],
    },
    {
      id: "4",
      title: "ジム",
      createdAt: "2025-10-30T09:00:00.000+09:00",
      dueAt: "2025-11-05T19:00:00.000+09:00",
      done: false,
      tags: [],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [tags, setTags] = useState("");

  const canAdd = useMemo(
    () => text.trim().length > 0 && dueAt != null,
    [text, dueAt]
  );

  const addTodo = () => {
    if (!canAdd) return;
    const newTodo = {
      id: String(Date.now()),
      title: text.trim(),
      createdAt: new Date().toISOString(),
      dueAt: dueAt ? dueAt.toISOString() : null,
      done: false,
      tags: tags
        .split(/[、,]/)
        .map((t) => t.trim())
        .filter(Boolean),
    };
    setTodos((prev) => [newTodo, ...prev]);
    setText("");
    setDueAt(null);
    setTags("");
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

  const filteredTodos = useMemo(() => {
    let list = todos;
    if (!showCompleted) list = list.filter((t) => !t.done);

    if (selectedFilter === "today") {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      list = list.filter((t) => {
        if (!t.dueAt) return false;
        const d = new Date(t.dueAt);
        return d >= start && d < end;
      });
    } else if (selectedFilter === "week") {
      const localNow = new Date();
      const startOfLocalDay = new Date(
        localNow.getFullYear(),
        localNow.getMonth(),
        localNow.getDate()
      );
      const endOfWeek = new Date(startOfLocalDay);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      list = list.filter((t) => {
        if (!t.dueAt) return false;
        const d = new Date(t.dueAt);
        return d >= startOfLocalDay && d < endOfWeek;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return [...list].sort((a, b) => {
      if (a.dueAt && b.dueAt) return new Date(a.dueAt) - new Date(b.dueAt);
      if (!a.dueAt && b.dueAt) return 1;
      if (a.dueAt && !b.dueAt) return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [todos, searchQuery, showCompleted, selectedFilter]);

  const closeCreateModal = () => {
    setShowPicker(false);
    setText("");
    setDueAt(null);
    setTags("");
    requestAnimationFrame(() => setShowCreate(false));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Modal
          visible={showCreate}
          animationType="slide"
          presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
          onRequestClose={closeCreateModal}
          onDismiss={Platform.OS === "ios" ? closeCreateModal : undefined}
        >
          <View style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleCenter}>新規作成</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!canAdd) return;
                  addTodo();
                  closeCreateModal();
                }}
                disabled={!canAdd}
              >
                <Text
                  style={[
                    styles.modalHeaderBtn,
                    { color: canAdd ? "#007AFF" : "#bbb" },
                  ]}
                >
                  追加
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
              <TextInput
                style={styles.input}
                placeholder="予定タイトルを入力"
                placeholderTextColor="#aaa"
                value={text}
                onChangeText={setText}
                returnKeyType="done"
              />

              <TextInput
                style={styles.input}
                placeholder="タグを入力（例：仕事,重要）"
                placeholderTextColor="#aaa"
                value={tags}
                onChangeText={setTags}
              />

              <TouchableOpacity
                style={[
                  styles.dueButton,
                  { backgroundColor: dueAt ? "#007AFF" : "#ddd" },
                ]}
                onPress={() => setShowPicker(true)}
              >
                <Text
                  style={[
                    styles.dueButtonText,
                    { color: dueAt ? "#fff" : "#555" },
                  ]}
                >
                  {dueAt ? "期限を変更" : "期限を選択してください"}
                </Text>
              </TouchableOpacity>

              {dueAt && (
                <Text style={styles.dueText}>
                  選択された期限：{dueAt.toLocaleString()}
                </Text>
              )}

              {showPicker && (
                <View style={styles.pickerRow}>
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={dueAt || new Date()}
                      mode="datetime"
                      display="default"
                      themeVariant="light"
                      onChange={(event, date) => {
                        setShowPicker(false);
                        if (date) setDueAt(date);
                      }}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => {
                      setDueAt(null);
                      setShowPicker(false);
                    }}
                  >
                    <Text style={styles.resetText}>リセット</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!dueAt && text.trim().length > 0 && (
                <Text style={styles.warningText}>
                  期限を選択後、追加できます
                </Text>
              )}
            </View>
          </View>
        </Modal>

        <View style={styles.tabRow}>
          {["all", "today", "week"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.tabButton,
                selectedFilter === type && styles.tabButtonActive,
              ]}
              onPress={() => setSelectedFilter(type)}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  selectedFilter === type && styles.tabButtonTextActive,
                ]}
              >
                {type === "all" ? "すべて" : type === "today" ? "今日" : "今週"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="タイトルやタグで検索"
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: showCompleted ? "#007AFF" : "#ddd" },
            ]}
            onPress={() => setShowCompleted(!showCompleted)}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: showCompleted ? "#fff" : "#555" },
              ]}
            >
              {showCompleted ? "完了非表示" : "完了表示"}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TodoItem
              item={item}
              onPress={() => openDetail(item)}
              onDelete={() => deleteTodo(item.id)}
              onToggle={() => toggleTodo(item.id)}
              onUpdateDue={updateDueDate}
              highlight={searchQuery}
            />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>まだ予定がありません</Text>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  modalHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  modalHeaderBtn: { fontSize: 16, fontWeight: "600", color: "#007AFF" },
  modalTitleCenter: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },

  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  tabButtonActive: { backgroundColor: "#007AFF" },
  tabButtonText: { fontSize: 14, color: "#555" },
  tabButtonTextActive: { color: "#fff", fontWeight: "700" },

  searchRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: "#fff",
  },
  filterButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  filterButtonText: { fontSize: 12, fontWeight: "600" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  dueButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  dueButtonText: { fontSize: 14, fontWeight: "600" },
  dueText: { fontSize: 12, color: "#555", marginBottom: 8 },

  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  resetText: { fontSize: 12, color: "#333", fontWeight: "600" },

  warningText: {
    color: "#b00",
    fontSize: 12,
    marginTop: 12,
    marginBottom: 5,
  },

  separator: { height: 8 },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
  },

  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
