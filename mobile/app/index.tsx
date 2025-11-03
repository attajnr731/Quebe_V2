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
} from "react-native";
import { useRouter } from "expo-router";

const Login = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Login with:", phoneNumber, password);
  };

  const handleContinueWithoutAccount = () => {
    // Navigate to main app or guest mode
    console.log("Continue without account");
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
              source={require("../assets/images/quebe.png")}
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
            <Text className="text-base text-gray-500 font-[Outfit]">
              Sign in to continue
            </Text>
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity className="border border-gray-300 rounded-lg py-3 flex-row items-center justify-center mb-6">
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.png",
              }}
              style={{ width: 20, height: 20, marginRight: 12 }}
              resizeMode="contain"
            />

            <Text className="text-gray-700 text-base font-medium font-[Outfit]">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-gray-500 text-sm font-[Outfit] mx-4">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
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
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mb-6">
              <Text className="text-sm text-blue-600 font-[Outfit]">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-4 items-center mb-4"
              onPress={handleLogin}
            >
              <Text className="text-white text-base font-semibold font-[Outfit]">
                Sign In
              </Text>
            </TouchableOpacity>

            {/* Continue Without Account */}
            <TouchableOpacity
              className="py-3 items-center"
              onPress={handleContinueWithoutAccount}
            >
              <Text className="text-gray-600 text-base font-[Outfit]">
                Continue without an account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600 font-[Outfit]">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-semibold font-[Outfit]">
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
