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
import { fetchOrganizations } from "../services/organizationService";

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
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [notifyAt, setNotifyAt] = useState("");
  const [step, setStep] = useState<"org" | "branch" | "service" | "review">(
    "org"
  );
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Get the selected organization object
  const selectedOrgData = organizations.find((o) => o._id === selectedOrg);

  useEffect(() => {
    if (visible) loadOrganizations();
    else reset();
  }, [visible]);

  const loadOrganizations = async () => {
    setLoading(true);
    const orgs = await fetchOrganizations();
    setOrganizations(orgs);
    setLoading(false);
  };

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
            {loading ? (
              <Text className="text-center mt-3">Loading organizations...</Text>
            ) : (
              organizations
                .filter((o) =>
                  o.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((org) => (
                  <TouchableOpacity
                    key={org._id}
                    onPress={() => handleSelectOrg(org._id)}
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
                ))
            )}
          </ScrollView>
        );

      case "branch":
        return (
          <ScrollView className="px-4 pt-3">
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Select Branch
            </Text>
            {selectedOrgData?.branches?.map((branch: any) => (
              <TouchableOpacity
                key={branch._id}
                onPress={() => handleSelectBranch(branch._id)}
                className={`border rounded-lg p-3 mb-2 ${
                  selectedBranch === branch._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text className="font-semibold text-gray-900">
                  {branch.name}
                </Text>
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
          </ScrollView>
        );

      default:
        return null;
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
            <View className="px-4 pb-5 pt-2">
              <TouchableOpacity
                onPress={handleJoin}
                disabled={isJoinDisabled}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={
                    isJoinDisabled
                      ? ["#9CA3AF", "#6B7280"]
                      : ["#2563EB", "#1D4ED8"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="py-4 flex-row justify-center items-center rounded-lg"
                >
                  <Text className="text-white font-bold text-xl">
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
