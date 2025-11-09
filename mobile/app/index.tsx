// mobile/app/index.tsx
import React, { useEffect, useState } from "react";
import { View, Image, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./contexts/AuthContext";

const Index = () => {
  const router = useRouter();
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const [splashComplete, setSplashComplete] = useState(false);

  // Show splash screen for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashComplete(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Navigate based on auth status after splash is complete
  useEffect(() => {
    if (splashComplete && !isLoading) {
      if (isAuthenticated) {
        router.replace("/screens/tabs/home");
      } else if (isGuest) {
        router.replace("/screens/tabs/joinQueue");
      } else {
        router.replace("/screens/login");
      }
    }
  }, [splashComplete, isLoading, isAuthenticated, isGuest, router]);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Image
        source={require("../assets/images/quebe.png")}
        className="w-40 h-40"
        resizeMode="contain"
      />
      <Text className="text-3xl font-bold text-gray-800 font-[Pacifico] pt-3">
        Quebe
      </Text>
      <Text className="text-gray-500 mt-2 font-[Outfit]">
        Virtual Queueing Made Easy
      </Text>

      {/* Show loading indicator if auth is still loading */}
      {splashComplete && isLoading && (
        <View className="mt-8">
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      )}
    </View>
  );
};

export default Index;
