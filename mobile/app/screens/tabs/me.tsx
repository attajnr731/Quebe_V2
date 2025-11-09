// mobile/app/screens/tabs/me.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";

const Me = () => {
  const { userData, logout } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Use actual user data from context
  const user = userData;

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing feature coming soon!");
  };

  const handleTopUp = () => {
    Alert.alert("Top Up", "Redirecting to payment...");
  };

  const handleTransactionHistory = () => {
    Alert.alert("Transaction History", "Feature coming soon!");
  };

  const handleHelpSupport = () => {
    Alert.alert("Help & Support", "Contact us at support@queueapp.com");
  };

  const handlePrivacyPolicy = () => {
    Alert.alert("Privacy Policy", "Opening privacy policy...");
  };

  const handleTermsConditions = () => {
    Alert.alert("Terms & Conditions", "Opening terms and conditions...");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
            // Navigate to login screen
            router.replace("/screens/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          } finally {
            setIsLoggingOut(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => console.log("Account deleted"),
          style: "destructive",
        },
      ]
    );
  };

  if (isLoggingOut) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4 font-[Outfit]">Logging out...</Text>
      </View>
    );
  }

  // Add null check for user data
  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4 font-[Outfit]">
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with Profile Card */}
      <LinearGradient
        colors={["#2563EB", "#1E3A8A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pb-8 px-6"
      >
        {/* Profile Avatar */}
        <View className="items-center mb-4 mt-12">
          <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-4 border-white/30">
            <Text className="text-4xl font-bold text-white">
              {user.name?.charAt(0) || "?"}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-white mt-3 font-[Outfit]">
            {user.name || "User"}
          </Text>
          <Text className="text-sm text-blue-100 mt-1 font-[Outfit]">
            {user.email || "No email"}
          </Text>
          <Text className="text-sm text-blue-100 font-[Outfit]">
            {user.phone || "No phone"}
          </Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-around py-5 bg-white/10 rounded-xl">
          <View className="items-center">
            <Text className="text-2xl font-bold text-white font-[Outfit]">
              {user.totalQueues || 0}
            </Text>
            <Text className="text-xs text-blue-100 mt-1 font-[Outfit]">
              Total Queues
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-white font-[Outfit]">
              {user.completedQueues || 0}
            </Text>
            <Text className="text-xs text-blue-100 mt-1 font-[Outfit]">
              Completed
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-white font-[Outfit]">
              {user.credit || 0} ₡
            </Text>
            <Text className="text-xs text-blue-100 mt-1 font-[Outfit]">
              Credits
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View className="px-6 py-4">
        {/* Account Section */}
        <View className="mb-4">
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <MenuItem
              icon="person-outline"
              title="Edit Profile"
              onPress={handleEditProfile}
              showBorder
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mb-4">
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <MenuItemWithSwitch
              icon="notifications-none"
              title="Push Notifications"
              subtitle="Get notified about queue updates"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              showBorder
            />
            <MenuItemWithSwitch
              icon="volume-up"
              title="Sound Alerts"
              subtitle="Play sound for notifications"
              value={soundEnabled}
              onValueChange={setSoundEnabled}
            />
          </View>
        </View>

        {/* Support Section */}
        <View className="mb-4">
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <MenuItem
              icon="privacy-tip"
              title="Privacy Policy"
              onPress={handlePrivacyPolicy}
              showBorder
            />
            <MenuItem
              icon="description"
              title="Terms & Conditions"
              onPress={handleTermsConditions}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mb-4">
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <MenuItem
              icon="logout"
              title="Logout"
              onPress={handleLogout}
              iconColor="#DC2626"
              titleColor="text-red-600"
              showBorder
            />
            <MenuItem
              icon="delete-outline"
              title="Delete Account"
              onPress={handleDeleteAccount}
              iconColor="#DC2626"
              titleColor="text-red-600"
            />
          </View>
        </View>

        {/* App Version */}
        <Text className="text-center text-sm text-gray-400 mb-8 font-[Outfit]">
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

// Menu Item Component
const MenuItem = ({
  icon,
  title,
  subtitle,
  onPress,
  iconColor = "#2563EB",
  titleColor = "text-gray-800",
  showBorder = false,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  titleColor?: string;
  showBorder?: boolean;
}) => (
  <>
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-4"
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
        <MaterialIcons name={icon as any} size={22} color={iconColor} />
      </View>
      <View className="flex-1 ml-3">
        <Text className={`text-base font-semibold ${titleColor} font-[Outfit]`}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 mt-0.5 font-[Outfit]">
            {subtitle}
          </Text>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
    </TouchableOpacity>
    {showBorder && <View className="h-px bg-gray-100 ml-16" />}
  </>
);

// Menu Item with Switch Component
const MenuItemWithSwitch = ({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  showBorder = false,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  showBorder?: boolean;
}) => (
  <>
    <View className="flex-row items-center px-4 py-4">
      <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
        <MaterialIcons name={icon as any} size={22} color="#2563EB" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-gray-800 font-[Outfit]">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 mt-0.5 font-[Outfit]">
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
        thumbColor={value ? "#2563EB" : "#F3F4F6"}
      />
    </View>
    {showBorder && <View className="h-px bg-gray-100 ml-16" />}
  </>
);

export default Me;
