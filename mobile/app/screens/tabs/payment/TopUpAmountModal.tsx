import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  visible: boolean;
  amount: string;
  onAmountChange: (text: string) => void;
  onClose: () => void;
  onProceed: () => void;
};

const quickAmounts = [5, 10, 20, 50, 100];

export default function TopUpAmountModal({
  visible,
  amount,
  onAmountChange,
  onClose,
  onProceed,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-black/50 justify-center items-center"
      >
        <View className="bg-white rounded-3xl w-11/12 max-w-md p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-800">
              Top Up Credit
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-2">Enter Amount</Text>
            <View className="flex-row items-center border-2 border-blue-500 rounded-xl px-4 bg-blue-50">
              <Text className="text-2xl font-bold text-gray-700 mr-2">GH₵</Text>
              <TextInput
                value={amount}
                onChangeText={onAmountChange}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="flex-1 text-3xl font-bold text-gray-900 py-4"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
            </View>
          </View>

          {/* Quick Amount Buttons */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-3">Quick Select</Text>
            <View className="flex-row flex-wrap gap-2">
              {quickAmounts.map((a) => (
                <TouchableOpacity
                  key={a}
                  onPress={() => onAmountChange(a.toString())}
                  className="bg-gray-100 px-4 py-3 rounded-lg border border-gray-200"
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-800 font-semibold">GH₵ {a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={onProceed}
            activeOpacity={0.9}
            className="rounded overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#2563EB", "#1E3A8A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="py-4 px-8 flex-row justify-center items-center"
            >
              <Text className="text-white  font-bold text-xl tracking-wide text-center py-5">
                Continue to Payment
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
