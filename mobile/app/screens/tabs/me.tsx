import { View, Text } from "react-native";
import React from "react";

const Me = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-semibold text-gray-800">My Profile</Text>
      <Text className="text-gray-500 mt-2">
        Manage your account and settings
      </Text>
    </View>
  );
};

export default Me;
