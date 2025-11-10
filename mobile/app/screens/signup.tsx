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
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { signupClient } from "../services/authService"; // 👈 we'll add this next
import { useAuth } from "../contexts/AuthContext";

const SignUp = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    if (!name || !phone || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      // send signup data to backend
      const data = await signupClient(name, phone, password, email, photoURL);

      if (!data.success) {
        Alert.alert("Signup Failed", data.message || "Try again later.");
        return;
      }

      // automatically log user in
      if (data.client) {
        await login(data.token, data.client);
        router.replace("/screens/tabs/home");
      } else {
        Alert.alert("Error", "No user data received from server");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
          {/* Avatar Picker */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-gray-900 font-[Outfit] mb-3">
              Create Account
            </Text>
            <TouchableOpacity
              onPress={handlePickImage}
              className="w-28 h-28 rounded-full mb-4 items-center justify-center border-2 border-blue-500 relative"
            >
              {photoURL ? (
                <Image
                  source={{ uri: photoURL }}
                  className="w-28 h-28 rounded-full"
                />
              ) : (
                <View className="items-center justify-center">
                  <MaterialIcons name="person" size={50} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-1 font-[Outfit] text-xs">
                    Add Photo
                  </Text>
                </View>
              )}
              <View className="absolute bottom-1 right-1 bg-blue-600 p-1 rounded-full">
                <MaterialIcons name="camera-alt" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View className="mb-6">
            {/* Full Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 font-[Outfit] mb-2">
                Full Name
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white text-base font-[Outfit]"
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 font-[Outfit] mb-2">
                Phone Number
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white text-base font-[Outfit]"
                placeholder="e.g. 0241234567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!isLoading}
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 font-[Outfit] mb-2">
                Email
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white text-base font-[Outfit]"
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </View>

            {/* Password */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 font-[Outfit] mb-2">
                Password
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white text-base font-[Outfit]"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              className={`rounded-lg py-4 items-center mb-4 ${
                isLoading ? "bg-blue-400" : "bg-blue-600"
              }`}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold font-[Outfit]">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600 font-[Outfit]">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/screens/login")}
              disabled={isLoading}
            >
              <Text
                className={`font-semibold font-[Outfit] ${
                  isLoading ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
