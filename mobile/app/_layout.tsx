import * as Font from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      Poppins: require("../assets/fonts/Pacifico-Regular.ttf"),
      Outfit: require("../assets/fonts/Outfit-Regular.ttf"),
    }).then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="screens/login" options={{ headerShown: false }} />
        <Stack.Screen name="screens/signup" options={{ headerShown: false }} />
        <Stack.Screen name="screens/home" options={{ headerShown: false }} />
        <Stack.Screen name="screens/history" options={{ headerShown: false }} />
        <Stack.Screen name="screens/profile" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
