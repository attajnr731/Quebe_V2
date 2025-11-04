import React, { useEffect } from "react";
import { View, Image, Text } from "react-native";
import { useRouter } from "expo-router";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/screens/login"); // navigate after 3 seconds
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

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
      <Text className="text-gray-500 mt-2">Virtual Queueing Made Easy</Text>
    </View>
  );
};

export default Index;
