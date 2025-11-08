import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

// Mock data with serving time as minutes
const mockHistory = [
  {
    id: "1",
    orgName: "St. Mary Hospital",
    branch: "Main Branch",
    service: "Consultation",
    servingTimeMin: 42,
    date: "2025-11-01",
    waitTime: 25,
    status: "Completed",
    queueCode: "SR3D",
    notifiedPosition: 3,
    credits: 5,
  },
  {
    id: "2",
    orgName: "MTN Service Center",
    branch: "Accra Mall",
    service: "SIM Replacement",
    servingTimeMin: 28,
    date: "2025-10-28",
    waitTime: 15,
    status: "Completed",
    queueCode: "M8K2",
    notifiedPosition: 5,
    credits: 3,
  },
  {
    id: "3",
    orgName: "DVLA Office",
    branch: "Tema",
    service: "License Renewal",
    servingTimeMin: 0,
    date: "2025-10-26",
    waitTime: 70,
    status: "Cancelled",
    queueCode: "D7P9",
    notifiedPosition: null,
    credits: 0,
  },
  {
    id: "4",
    orgName: "Ecobank",
    branch: "Legon Branch",
    service: "Account Opening",
    servingTimeMin: 55,
    date: "2025-10-20",
    waitTime: 32,
    status: "Completed",
    queueCode: "E4B6",
    notifiedPosition: 2,
    credits: 8,
  },
  {
    id: "5",
    orgName: "Vodafone Office",
    branch: "Osu",
    service: "Broadband Support",
    servingTimeMin: 35,
    date: "2025-10-10",
    waitTime: 18,
    status: "Completed",
    queueCode: "V1T5",
    notifiedPosition: 4,
    credits: 4,
  },
];

const History = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100";
      case "Cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return "check-circle";
      case "Cancelled":
        return "cancel";
      default:
        return "help";
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes === 0) return "—";
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m > 0 ? `${m}m` : ""}`.trim();
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderItem = ({ item }: any) => {
    const isExpanded = expandedId === item.id;

    return (
      <HistoryCard
        item={item}
        isExpanded={isExpanded}
        onPress={() => toggleExpand(item.id)}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        formatTime={formatTime}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50 px-5 pt-10">
      <Text className="text-2xl font-semibold text-gray-800 mb-1">History</Text>
      <Text className="text-gray-500 mb-5">Your past queue records</Text>

      <FlatList
        data={mockHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

// Separate component for animation
const HistoryCard = ({
  item,
  isExpanded,
  onPress,
  getStatusColor,
  getStatusIcon,
  formatTime,
}: any) => {
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    if (isExpanded) {
      height.value = withTiming(160, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      opacity.value = withDelay(100, withTiming(1, { duration: 250 }));
      rotate.value = withTiming(180, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      height.value = withTiming(0, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      opacity.value = withTiming(0, { duration: 150 });
      rotate.value = withTiming(0, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [isExpanded]);

  const expandedStyle = useAnimatedStyle(() => ({
    maxHeight: height.value,
    opacity: opacity.value,
    overflow: "hidden",
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-white p-4 mb-1 rounded-lg border border-gray-100"
    >
      {/* Collapsed View - Main Info */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
            {item.orgName}
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
            {item.service}
          </Text>
        </View>

        <View className="flex-row items-center">
          <View
            className={`px-2.5 py-1 rounded-full flex-row items-center ${getStatusColor(
              item.status
            )}`}
          >
            <MaterialIcons
              name={getStatusIcon(item.status) as any}
              size={14}
              color={item.status === "Completed" ? "#16A34A" : "#DC2626"}
            />
            <Text
              className={`text-xs font-semibold ml-1 ${
                item.status === "Completed" ? "text-green-600" : "text-red-600"
              }`}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats Row */}
      <View className="flex-row items-center justify-between mt-2">
        <View className="flex-row items-center">
          <MaterialIcons name="event" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1.5 font-medium">
            {item.date}
          </Text>
        </View>

        <View className="flex-row items-center">
          <MaterialIcons name="timer" size={16} color="#2563EB" />
          <Text className="text-sm text-blue-600 ml-1.5 font-semibold">
            {formatTime(item.waitTime)}
          </Text>
        </View>

        <Animated.View style={chevronStyle}>
          <MaterialIcons name="expand-more" size={24} color="#9CA3AF" />
        </Animated.View>
      </View>

      {/* Expanded Details with Animation */}
      <Animated.View style={expandedStyle}>
        <View className="mt-4 pt-4 border-t border-gray-100">
          {/* Details Grid */}
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">
                Branch
              </Text>
              <Text className="text-sm text-gray-800 font-semibold">
                {item.branch}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">
                Queue Code
              </Text>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-sm text-blue-700 font-bold tracking-wider">
                  {item.queueCode}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">
                Notified Position
              </Text>
              <Text className="text-sm text-gray-800 font-semibold">
                {item.notifiedPosition ? `#${item.notifiedPosition}` : "—"}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">
                Service Duration
              </Text>
              <Text className="text-sm text-gray-800 font-semibold">
                {formatTime(item.servingTimeMin)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">
                Credits Used
              </Text>
              <View className="flex-row items-center">
                <Text className="text-base text-blue-600 font-bold mr-1">
                  {item.credits}
                </Text>
                <Text className="text-sm text-gray-500">₡</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default History;
