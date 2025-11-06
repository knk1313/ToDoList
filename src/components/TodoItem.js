import DateTimePicker from "@react-native-community/datetimepicker";
import Checkbox from "expo-checkbox";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

function renderHighlighted(text = "", query = "") {
  if (!query?.trim()) return <Text>{text}</Text>;
  const q = query.trim();
  const regex = new RegExp(
    `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return (
    <>
      {text.split(regex).map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <Text key={i} style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </>
  );
}

export default function TodoItem({
  item,
  onPress,
  onDelete,
  onToggle,
  onUpdateDue,
  highlight,
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onDelete}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.6 }]}
    >
      <View style={styles.row}>
        <Checkbox value={item.done} onValueChange={onToggle} />
        <Text
          style={[
            styles.title,
            item.done && { textDecorationLine: "line-through", color: "#999" },
          ]}
          numberOfLines={1}
        >
          {renderHighlighted(item.title, highlight)}
        </Text>
      </View>

      <Pressable style={styles.linkBtn} onPress={() => setShowPicker(true)}>
        <Text style={styles.linkBtnText}>
          {item.dueAt ? "期限を変更" : "期限を設定"}
        </Text>
      </Pressable>

      {item.dueAt ? (
        <Text
          style={[
            styles.metaText,
            new Date(item.dueAt) < new Date() && { color: "red" },
          ]}
        >
          期限: {new Date(item.dueAt).toLocaleString()}
        </Text>
      ) : null}

      <Text style={styles.metaText}>
        作成: {new Date(item.createdAt).toLocaleString()}
      </Text>

      {showPicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={item.dueAt ? new Date(item.dueAt) : new Date()}
            mode="datetime"
            display="default"
            themeVariant="light"
            onChange={(event, date) => {
              setShowPicker(false);
              if (date && typeof onUpdateDue === "function") {
                onUpdateDue(item.id, date.toISOString());
              }
            }}
          />
        </View>
      )}

      {item.tags?.length > 0 && (
        <View style={styles.tagRow}>
          {item.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 8,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: "600", flex: 1 },
  highlight: { backgroundColor: "yellow" },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: {
    backgroundColor: "#eee",
    color: "#333",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
  },

  metaText: { fontSize: 12, color: "#666" },

  linkBtn: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  linkBtnText: { fontSize: 12, color: "#007aff" },

  pickerContainer: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
});
