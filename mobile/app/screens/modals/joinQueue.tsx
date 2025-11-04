import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { organizations } from "../mock/organizations";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface JoinQueueProps {
  visible: boolean;
  onClose: () => void;
  onJoinQueue: (data: {
    orgId: string;
    serviceId?: string;
    notifyAt?: number;
    notes?: string;
  }) => void;
}

const JoinQueue: React.FC<JoinQueueProps> = ({
  visible,
  onClose,
  onJoinQueue,
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [notifyAt, setNotifyAt] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Mock: Last 3 joined
  const lastJoined = ["org1", "org3", "org2"];

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    }
  }, [visible]);

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleJoin = () => {
    if (!selectedOrg) return;
    onJoinQueue({
      orgId: selectedOrg,
      serviceId: selectedService || undefined,
      notifyAt: notifyAt ? parseInt(notifyAt) : undefined,
      notes: notes.trim() || undefined,
    });
    reset();
  };

  const reset = () => {
    setSelectedOrg(null);
    setSelectedService(null);
    setNotifyAt("");
    setNotes("");
    setSearch("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOrgData = organizations.find((o) => o.id === selectedOrg);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          className="absolute inset-0"
        >
          <Animated.View
            style={[animatedBackdropStyle]}
            className="flex-1 bg-black/50"
          />
        </TouchableOpacity>

        <Animated.View
          style={[animatedModalStyle]}
          className="absolute bottom-0 w-full"
        >
          <View className="bg-white rounded-t-3xl shadow-2xl max-h-[85%]">
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            <View className="px-6 pt-2 pb-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900">
                  Join Queue
                </Text>
                <TouchableOpacity onPress={handleClose} className="p-2">
                  <MaterialIcons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="px-6 pt-4 pb-6">
                {/* Last Joined */}
                {lastJoined.length > 0 && !selectedOrg && (
                  <View className="mb-6">
                    <Text className="text-sm font-semibold text-gray-600 mb-2">
                      Recent
                    </Text>
                    <View className="flex-row gap-2">
                      {lastJoined.map((id) => {
                        const org = organizations.find((o) => o.id === id);
                        if (!org) return null;
                        return (
                          <TouchableOpacity
                            key={id}
                            onPress={() => setSelectedOrg(id)}
                            className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex-1 items-center"
                          >
                            <MaterialIcons
                              name={org.logo as any}
                              size={20}
                              color="#2563EB"
                            />
                            <Text className="text-xs font-medium text-blue-700 mt-1">
                              {org.name.split(" ")[0]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Search */}
                {!selectedOrg && (
                  <View className="mb-4">
                    <TextInput
                      value={search}
                      onChangeText={setSearch}
                      placeholder="Search organizations..."
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    />
                  </View>
                )}

                {/* Organization List */}
                {!selectedOrg && (
                  <View className="space-y-3">
                    {filteredOrgs.map((org) => (
                      <TouchableOpacity
                        key={org.id}
                        onPress={() => setSelectedOrg(org.id)}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center justify-between"
                      >
                        <View className="flex-row items-center flex-1">
                          <MaterialIcons
                            name={org.logo as any}
                            size={28}
                            color="#2563EB"
                          />
                          <View className="ml-3 flex-1">
                            <Text className="font-semibold text-gray-900">
                              {org.name}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {org.type === "bank"
                                ? "Choose service"
                                : `${org.queueSize} in queue`}
                            </Text>
                          </View>
                        </View>
                        <MaterialIcons
                          name="chevron-right"
                          size={24}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Service Selection (Bank) */}
                {selectedOrg && selectedOrgData?.type === "bank" && (
                  <View>
                    <TouchableOpacity
                      onPress={() => setSelectedOrg(null)}
                      className="flex-row items-center mb-4"
                    >
                      <MaterialIcons
                        name="arrow-back"
                        size={20}
                        color="#2563EB"
                      />
                      <Text className="ml-1 text-blue-600 font-medium">
                        Back
                      </Text>
                    </TouchableOpacity>
                    <Text className="font-semibold text-gray-900 mb-3">
                      Select Service
                    </Text>
                    <View className="space-y-3">
                      {selectedOrgData.services!.map((service) => (
                        <TouchableOpacity
                          key={service.id}
                          onPress={() => setSelectedService(service.id)}
                          className={`p-4 rounded-xl border ${
                            selectedService === service.id
                              ? "bg-blue-50 border-blue-500"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <View className="flex-row justify-between">
                            <View>
                              <Text className="font-medium text-gray-900">
                                {service.name}
                              </Text>
                              <Text className="text-xs text-gray-500 mt-1">
                                {service.queueSize} in queue • ~
                                {service.avgWaitMin}m avg
                              </Text>
                            </View>
                            {selectedService === service.id && (
                              <MaterialIcons
                                name="check"
                                size={20}
                                color="#2563EB"
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Notification Position */}
                {(selectedOrg && selectedOrgData?.type !== "bank") ||
                selectedService ? (
                  <View className="mt-6">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Notify me when I'm #{notifyAt || "?"} (optional)
                    </Text>
                    <TextInput
                      value={notifyAt}
                      onChangeText={setNotifyAt}
                      placeholder="e.g., 3"
                      keyboardType="number-pad"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    />
                  </View>
                ) : null}

                {/* Notes */}
                <View className="mt-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Notes (optional)
                  </Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Any special requests..."
                    multiline
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-20 text-base"
                    textAlignVertical="top"
                  />
                </View>

                {/* Join Button */}
                {/* Join Button */}
                <TouchableOpacity
                  onPress={handleJoin}
                  disabled={
                    !selectedOrg ||
                    (selectedOrgData?.type === "bank" && !selectedService)
                  }
                  className="mt-8 rounded-xl overflow-hidden"
                >
                  <LinearGradient
                    colors={
                      selectedOrg &&
                      (selectedOrgData?.type !== "bank" || selectedService)
                        ? ["#2563EB", "#1E3A8A"]
                        : ["#D1D5DB", "#9CA3AF"]
                    }
                    className="py-4"
                  >
                    <Text className="text-center text-white font-bold text-base">
                      Join Queue
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default JoinQueue;
