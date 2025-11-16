// src/components/JoinQueue.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { fetchOrganizations } from "../../services/organizationService";
import { SkeletonJoinQueue } from "../skeletons/SkeletonJoinQueue";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.65;

interface JoinQueueProps {
  visible: boolean;
  onClose: () => void;
  onJoinQueue: (data: {
    orgId: string;
    branchId?: string;
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
  const [notifyAt, setNotifyAt] = useState("");
  const [step, setStep] = useState<"org" | "branch" | "review">("org");
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const selectedOrgData = organizations.find((o) => o._id === selectedOrg);
  const selectedBranchData = selectedOrgData?.branches?.find(
    (b: any) => b._id === selectedBranch
  );

  // Load organizations
  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchOrganizations()
        .then(setOrganizations)
        .finally(() => setLoading(false));
    } else {
      reset();
    }
  }, [visible]);

  const fadeTo = (next: typeof step) => {
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
    if (step === "branch") {
      setSelectedOrg(null);
      fadeTo("org");
    } else if (step === "review") {
      setSelectedBranch(null);
      fadeTo("branch");
    }
  };

  const handleSelectOrg = (orgId: string) => {
    setSelectedOrg(orgId);
    fadeTo("branch");
  };

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranch(branchId);
    fadeTo("review");
  };

  const isJoinDisabled = !selectedOrg || !selectedBranch;

  const handleJoin = () => {
    if (isJoinDisabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onJoinQueue({
      orgId: selectedOrg!,
      branchId: selectedBranch!,
      notifyAt: notifyAt ? parseInt(notifyAt, 10) : undefined,
    });
    reset();
    onClose();
  };

  const reset = () => {
    setSelectedOrg(null);
    setSelectedBranch(null);
    setNotifyAt("");
    setSearch("");
    setStep("org");
  };

  // Show skeleton while loading
  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-end"
          >
            <SkeletonJoinQueue step={step} />
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  }

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
              {step === "org" && (
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
                    ))}
                </ScrollView>
              )}

              {step === "branch" && selectedOrgData && (
                <ScrollView className="px-4 pt-3">
                  <Text className="text-base font-semibold text-gray-800 mb-3">
                    Select Branch
                  </Text>
                  {selectedOrgData.branches?.map((branch: any) => (
                    <TouchableOpacity
                      key={branch._id}
                      onPress={() => handleSelectBranch(branch._id)}
                      className={`border rounded-lg p-3 mb-2 ${
                        selectedBranch === branch._id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <Text className=" text-gray-900 text-xl">
                        {branch.name}
                      </Text>
                      {branch.queueCount != null && (
                        <Text className="text-lg text-gray-600 mt-1">
                          {branch.queueCount} in queue
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {step === "review" && (
                <ScrollView className="px-4 pt-3 pb-20">
                  <Text className="text-base font-semibold text-gray-800 mb-3">
                    Review
                  </Text>
                  <View className="bg-gray-50 rounded-lg p-3 mb-2">
                    <Text className="text-lg text-gray-600">Organization</Text>
                    <Text className="font-semibold text-gray-900">
                      {selectedOrgData?.name}
                    </Text>
                  </View>
                  <View className="bg-gray-50 rounded-lg p-3 mb-2">
                    <Text className="text-lg text-gray-600">Branch</Text>
                    <Text className="font-semibold text-gray-900">
                      {selectedBranchData?.name}
                    </Text>
                  </View>

                  <View className="mt-4">
                    <Text className="font-medium text-gray-700 mb-2">
                      Notify me when I'm #
                    </Text>
                    <TextInput
                      value={notifyAt}
                      onChangeText={(t) =>
                        setNotifyAt(t.replace(/[^0-9]/g, "").slice(0, 3))
                      }
                      keyboardType="number-pad"
                      placeholder="e.g., 3"
                      className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                    />
                  </View>
                </ScrollView>
              )}
            </Animated.View>

            {/* Join Button */}
            <View className="">
              <TouchableOpacity
                onPress={handleJoin}
                disabled={isJoinDisabled}
                activeOpacity={0.9}
                className="rounded overflow-hidden"
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
