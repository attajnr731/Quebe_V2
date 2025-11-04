import { View, Text } from "react-native";
import React from "react";

const History = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-semibold text-gray-800">History</Text>
      <Text className="text-gray-500 mt-2">Your past queue records</Text>
    </View>
  );
};

export default History;
