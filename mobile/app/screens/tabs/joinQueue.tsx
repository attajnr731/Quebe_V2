// mobile/app/screens/tabs/joinqueue.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

const JoinQueue = () => {
  const router = useRouter();

  const handleSignUp = () => {
    // Navigate to sign up screen (you'll need to create this)
    router.push("/screens/signup");
  };

  const handleLogin = () => {
    router.push("/screens/login");
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      <Image
        source={require("../../../assets/images/quebe.png")}
        style={{
          width: 100,
          height: 100,
          marginBottom: 24,
        }}
        resizeMode="contain"
      />

      <Text className="text-2xl font-bold text-gray-900 font-[Outfit] mb-4 text-center">
        Join the Queue
      </Text>

      <Text className="text-base text-gray-600 font-[Outfit] mb-8 text-center">
        Create an account to join queues, track your position, and get
        notifications.
      </Text>

      <TouchableOpacity
        className="bg-blue-600 rounded-lg py-4 px-8 w-full items-center mb-4"
        onPress={handleSignUp}
      >
        <Text className="text-white text-base font-semibold font-[Outfit]">
          Create Account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-blue-600 rounded-lg py-4 px-8 w-full items-center"
        onPress={handleLogin}
      >
        <Text className="text-blue-600 text-base font-semibold font-[Outfit]">
          Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default JoinQueue;
