// mobile/app/screens/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { loginClient } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const router = useRouter();
  const { login, continueAsGuest } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  // mobile/app/screens/login.tsx - Update the handleLogin function
  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please enter both phone number and password.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting login...");
      const data = await loginClient(phoneNumber, password);
      console.log("Login response:", data);

      if (!data.success) {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
        return;
      }

      console.log("Login successful:", data);

      // Save token and user data
      if (data.token && data.client) {
        await login(data.token, data.client);
        router.replace("/screens/tabs/home");
      } else {
        Alert.alert("Error", "No token or user data received from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithoutAccount = async () => {
    setIsGuestLoading(true);
    try {
      await continueAsGuest();
      router.replace("/screens/tabs/joinQueue");
    } catch (error) {
      console.error("Guest mode error:", error);
      Alert.alert("Error", "Failed to continue as guest");
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8 py-12">
          {/* Logo and Header */}
          <View className="items-center mb-12">
            <Image
              source={require("../../assets/images/quebe.png")}
              style={{
                width: 80,
                height: 80,
                marginBottom: 16,
              }}
              resizeMode="contain"
            />
            <Text className="text-3xl font-bold text-gray-900 font-[Outfit] mb-2">
              Welcome Back
            </Text>
          </View>

          {/* Login Form */}
          <View className="mb-6">
            {/* Phone Number Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 font-[Outfit] mb-2">
                Phone Number
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base font-[Outfit] bg-white"
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 font-[Outfit] mb-2">
                Password
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base font-[Outfit] bg-white"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mb-6" disabled={isLoading}>
              <Text className="text-sm text-blue-600 font-[Outfit]">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className={`rounded-lg py-4 items-center mb-4 ${
                isLoading ? "bg-blue-400" : "bg-blue-600"
              }`}
              onPress={handleLogin}
              disabled={isLoading || isGuestLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold font-[Outfit]">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Continue Without Account */}
            <TouchableOpacity
              className="py-3 items-center"
              onPress={handleContinueWithoutAccount}
              disabled={isLoading || isGuestLoading}
            >
              {isGuestLoading ? (
                <ActivityIndicator color="#4B5563" />
              ) : (
                <Text
                  className={`text-base font-[Outfit] ${
                    isLoading ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Continue without an account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600 font-[Outfit]">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity disabled={isLoading || isGuestLoading}>
              <Text
                className={`font-semibold font-[Outfit] ${
                  isLoading || isGuestLoading
                    ? "text-blue-400"
                    : "text-blue-600"
                }`}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
