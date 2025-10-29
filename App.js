import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DetailScreen from "./src/screens/DetailScreen";
import HomeScreen from "./src/screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "ToDo リスト" }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: "詳細" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
