import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function initNotifications() {
  if (!Device.isDevice) {
    console.log("通知は実機のみ対応です");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("通知の権限がありません");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function scheduleTodoNotification(todo) {
  if (!todo.dueAt) return null;

  const dueDate = new Date(todo.dueAt);

  const aheadMs = 10 * 60 * 1000;
  let triggerDate = new Date(dueDate.getTime() - aheadMs);
  const now = new Date();

  //if (triggerDate <= now) {
  //  triggerDate = new Date(now.getTime() + 5000);
  //}

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "期限が近づいています",
        body: todo.title || "タスクの期限が近づいています",
        data: { todoId: todo.id },
      },
      trigger: triggerDate,
    });
    return id;
  } catch (e) {
    console.warn("通知スケジュール失敗:", e);
    return null;
  }
}

export async function cancelTodoNotification(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.warn("通知キャンセル失敗:", e);
  }
}
