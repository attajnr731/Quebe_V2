// src/components/JoinQueue.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { organizations } from "../mock/organizations";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.68;

interface JoinQueueProps {
  visible: boolean;
  onClose: () => void;
  onJoinQueue: (data: {
    orgId: string;
    branchId?: string;
    serviceId?: string;
    notifyAt?: number;
  }) => void;
}

const JoinQueue: React.FC<JoinQueueProps> = ({
  visible,
  onClose,
  onJoinQueue,
}) => {
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [notifyAt, setNotifyAt] = useState("");
  const [step, setStep] = useState<"org" | "branch" | "service" | "review">(
    "org"
  );

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const selectedOrgData = organizations.find((o) => o.id === selectedOrg);
  const selectedBranchData = selectedOrgData?.branches?.find(
    (b) => b.id === selectedBranch
  );
  const selectedServiceData = selectedOrgData?.services?.find(
    (s) => s.id === selectedService
  );

  useEffect(() => {
    if (!visible) reset();
  }, [visible]);

  const fadeToStep = (next: typeof step) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setStep(next));
  };

  const goBack = () => {
    const order = ["org", "branch", "service", "review"] as const;
    const curIdx = order.indexOf(step);
    if (curIdx > 0) fadeToStep(order[curIdx - 1]);
  };

  const handleSelectOrg = (orgId: string) => {
    setSelectedOrg(orgId);
    fadeToStep("branch");
  };

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranch(branchId);
    const org = selectedOrgData!;
    if (org.type === "bank") fadeToStep("service");
    else fadeToStep("review");
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    fadeToStep("review");
  };

  const getBranchQueueInfo = (branchId: string) => {
    const branch = selectedOrgData?.branches?.find((b) => b.id === branchId);
    if (!selectedOrgData) return { queue: 0, wait: 0 };
    if (selectedOrgData.type === "bank") {
      const total =
        selectedOrgData.services?.reduce((sum, s) => sum + s.queueSize, 0) ?? 0;
      const weightedWait =
        selectedOrgData.services?.reduce(
          (sum, s) => sum + s.avgWaitMin * s.queueSize,
          0
        ) ?? 0;
      const avgWait = total ? Math.round(weightedWait / total) : 0;
      return { queue: total, wait: avgWait };
    }
    return { queue: branch?.queueCount ?? 0, wait: branch?.avgWaitTime ?? 0 };
  };

  const isJoinDisabled =
    !selectedOrg ||
    !selectedBranch ||
    (selectedOrgData?.type === "bank" && !selectedService);

  const handleJoin = () => {
    if (isJoinDisabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onJoinQueue({
      orgId: selectedOrg!,
      branchId: selectedBranch!,
      serviceId: selectedService || undefined,
      notifyAt: notifyAt ? parseInt(notifyAt, 10) : undefined,
    });
    reset();
    onClose();
  };

  const reset = () => {
    setSelectedOrg(null);
    setSelectedBranch(null);
    setSelectedService(null);
    setNotifyAt("");
    setSearch("");
    setStep("org");
  };

  const renderStep = () => {
    switch (step) {
      case "org":
        return (
          <ScrollView className="px-4 pt-3">
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search organization..."
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-5 mb-3"
            />
            {organizations
              .filter((o) =>
                o.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((org) => (
                <TouchableOpacity
                  key={org.id}
                  onPress={() => handleSelectOrg(org.id)}
                  className="border border-gray-200 rounded-lg px-3 py-5 flex-row items-center justify-between mb-2 bg-white"
                >
                  <View className="flex-row items-center flex-1">
                    <MaterialIcons
                      name={org.logo as any}
                      size={26}
                      color="#2563EB"
                    />
                    <View className="ml-2 flex-1">
                      <Text className="font-semibold text-gray-900">
                        {org.name}
                      </Text>
                      <Text className="text-[11px] text-gray-500 uppercase">
                        {org.type}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              ))}
          </ScrollView>
        );

      case "branch":
        return (
          <ScrollView className="px-4 pt-3">
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Select Branch
            </Text>
            {selectedOrgData?.branches?.map((branch) => {
              const { queue, wait } = getBranchQueueInfo(branch.id);
              return (
                <TouchableOpacity
                  key={branch.id}
                  onPress={() => handleSelectBranch(branch.id)}
                  className={`border rounded-lg p-3 mb-2 ${
                    selectedBranch === branch.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        {branch.name}
                      </Text>
                      <Text className="text-sm text-gray-600 mt-1">
                        {queue} in queue • {wait} min wait
                      </Text>
                    </View>
                    {selectedBranch === branch.id && (
                      <MaterialIcons
                        name="check-circle"
                        size={22}
                        color="#2563EB"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );

      case "service":
        return (
          <ScrollView className="px-4 pt-3">
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Select Service
            </Text>
            {selectedOrgData?.services?.map((service) => (
              <TouchableOpacity
                key={service.id}
                onPress={() => handleSelectService(service.id)}
                className={`border rounded-lg p-3 mb-2 ${
                  selectedService === service.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-semibold text-gray-900">
                      {service.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {service.queueSize} waiting • ~{service.avgWaitMin} min
                    </Text>
                  </View>
                  {selectedService === service.id && (
                    <MaterialIcons
                      name="check-circle"
                      size={22}
                      color="#2563EB"
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      case "review":
        return (
          <ScrollView className="px-4 pt-3 pb-20">
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Review
            </Text>

            <View className="bg-gray-50 rounded-lg p-3 mb-2">
              <Text className="text-sm text-gray-600">Organization</Text>
              <Text className="font-semibold text-gray-900">
                {selectedOrgData?.name}
              </Text>
            </View>

            {selectedBranchData && (
              <View className="bg-gray-50 rounded-lg p-3 mb-2">
                <Text className="text-sm text-gray-600">Branch</Text>
                <Text className="font-semibold text-gray-900">
                  {selectedBranchData.name}
                </Text>
              </View>
            )}

            {selectedServiceData && (
              <View className="bg-gray-50 rounded-lg p-3 mb-2">
                <Text className="text-sm text-gray-600">Service</Text>
                <Text className="font-semibold text-gray-900">
                  {selectedServiceData.name}
                </Text>
              </View>
            )}

            <View className="mt-2">
              <Text className="font-medium text-gray-700 mb-1">
                Notify me when I’m at position
              </Text>
              <TextInput
                value={notifyAt}
                onChangeText={(t) =>
                  setNotifyAt(t.replace(/[^0-9]/g, "").slice(0, 3))
                }
                keyboardType="number-pad"
                className="border border-gray-300 rounded-lg p-3 text-lg"
              />
              <Text className="text-[11px] text-gray-500 mt-1 ml-1">
                SMS notification when your turn is near
              </Text>
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <View
            className="bg-white rounded-t-2xl"
            style={{ height: MODAL_HEIGHT }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
              {step !== "org" ? (
                <TouchableOpacity onPress={goBack} hitSlop={10}>
                  <MaterialIcons
                    name="arrow-back-ios"
                    size={20}
                    color="#2563EB"
                  />
                </TouchableOpacity>
              ) : (
                <View className="w-5" />
              )}
              <Text className="text-base font-bold text-gray-800">
                Join Queue
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Step Content */}
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
              {renderStep()}
            </Animated.View>

            {/* Join Button */}
            <View className="">
              <TouchableOpacity
                onPress={handleJoin}
                disabled={isJoinDisabled}
                activeOpacity={0.9}
                className=" overflow-hidden "
              >
                <LinearGradient
                  colors={
                    isJoinDisabled
                      ? ["#9CA3AF", "#6B7280"]
                      : ["#2563EB", "#1D4ED8"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="py-4 px-8 flex-row justify-center items-center"
                >
                  <Text className="text-white  font-bold text-xl tracking-wide text-center py-5">
                    Join Queue
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default JoinQueue;
