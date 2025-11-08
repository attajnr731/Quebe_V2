import React, { useState, useEffect } from "react";
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
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.75;
const PANEL_RADIUS = 24;

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
  const [step, setStep] = useState<"org" | "branch" | "service" | "done">(
    "org"
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownType, setDropdownType] = useState<"branch" | "service" | null>(
    null
  );

  const translateX = useState(new Animated.Value(0))[0];

  const animateToNext = () => {
    Animated.timing(translateX, {
      toValue: -SCREEN_HEIGHT,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const animateBack = () => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectOrg = (id: string) => {
    setSelectedOrg(id);
    setStep("branch");
    animateToNext();
  };

  const handleBack = () => {
    if (step === "branch") {
      setSelectedOrg(null);
      setStep("org");
      animateBack();
    } else if (step === "service") {
      setSelectedService(null);
      setStep("branch");
    } else if (step === "done") {
      setStep("service");
    }
  };

  const selectedOrgData = organizations.find((o) => o.id === selectedOrg);

  const showNotify =
    selectedOrgData &&
    selectedOrgData.type !== "hospital" &&
    (selectedOrgData.type !== "bank" || selectedService);

  const handleJoin = () => {
    if (!selectedOrg) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onJoinQueue({
      orgId: selectedOrg,
      branchId: selectedBranch || undefined,
      serviceId: selectedService || undefined,
      notifyAt: notifyAt ? parseInt(notifyAt) : undefined,
    });
    reset();
    onClose();
  };

  const reset = () => {
    setSelectedOrg(null);
    setSelectedBranch(null);
    setSelectedService(null);
    setNotifyAt("");
    setStep("org");
    setSearch("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
        >
          <Animated.View
            style={{
              transform: [{ translateY: 0 }],
              height: MODAL_HEIGHT,
            }}
            className="bg-white rounded-t-3xl"
          >
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 pt-5 pb-3 border-b border-gray-100">
              {step !== "org" ? (
                <TouchableOpacity onPress={handleBack}>
                  <MaterialIcons name="arrow-back" size={24} color="#2563EB" />
                </TouchableOpacity>
              ) : (
                <View className="w-6" />
              )}
              <Text className="text-lg font-bold text-gray-800">
                Join Queue
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24 }}
            >
              {step === "org" && (
                <>
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search organization..."
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 mb-4"
                  />
                  {organizations
                    .filter((o) =>
                      o.name.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((org) => (
                      <TouchableOpacity
                        key={org.id}
                        onPress={() => handleSelectOrg(org.id)}
                        className="border border-gray-200 rounded-xl p-4 flex-row items-center justify-between mb-3 bg-white"
                      >
                        <View className="flex-row items-center">
                          <MaterialIcons
                            name={org.logo as any}
                            size={28}
                            color="#2563EB"
                          />
                          <View className="ml-3">
                            <Text className="font-semibold text-gray-900">
                              {org.name}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {org.type.toUpperCase()}
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
                </>
              )}

              {step === "branch" && selectedOrgData && (
                <>
                  {selectedOrgData.branches && (
                    <>
                      <Text className="font-semibold text-gray-800 mb-2">
                        Select Branch
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setDropdownType("branch");
                          setDropdownVisible(true);
                        }}
                        className="border border-gray-200 rounded-xl px-4 py-4 flex-row justify-between items-center mb-4 bg-gray-50"
                      >
                        <Text className="text-gray-700">
                          {selectedBranch
                            ? selectedOrgData.branches.find(
                                (b) => b.id === selectedBranch
                              )?.name
                            : "Choose a branch"}
                        </Text>
                        <MaterialIcons
                          name="arrow-drop-down"
                          size={24}
                          color="#2563EB"
                        />
                      </TouchableOpacity>
                    </>
                  )}

                  {selectedOrgData.type === "bank" && (
                    <>
                      <Text className="font-semibold text-gray-800 mb-2">
                        Select Service
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setDropdownType("service");
                          setDropdownVisible(true);
                        }}
                        className="border border-gray-200 rounded-xl px-4 py-4 flex-row justify-between items-center mb-4 bg-gray-50"
                      >
                        <Text className="text-gray-700">
                          {selectedService
                            ? selectedOrgData.services?.find(
                                (s) => s.id === selectedService
                              )?.name
                            : "Choose a service"}
                        </Text>
                        <MaterialIcons
                          name="arrow-drop-down"
                          size={24}
                          color="#2563EB"
                        />
                      </TouchableOpacity>
                    </>
                  )}

                  {showNotify && (
                    <View className="mt-6">
                      <Text className="font-semibold text-gray-700 mb-2">
                        Notify me when I’m #{notifyAt || "?"} (optional)
                      </Text>
                      <TextInput
                        value={notifyAt}
                        onChangeText={setNotifyAt}
                        keyboardType="number-pad"
                        placeholder="e.g., 3"
                        className="border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50"
                      />
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {/* Join Button */}
            <View className="">
              <TouchableOpacity
                onPress={handleJoin}
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
                    Join Queue
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>

        {/* Dropdown Modal */}
        <Modal
          visible={dropdownVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPressOut={() => setDropdownVisible(false)}
            className="flex-1 bg-black/40 justify-center items-center"
          >
            <View className="bg-white rounded-2xl w-4/5 p-5">
              {dropdownType === "branch" &&
                selectedOrgData?.branches?.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => {
                      setSelectedBranch(b.id);
                      setDropdownVisible(false);
                    }}
                    className="p-3 border-b border-gray-100"
                  >
                    <Text className="text-gray-800">{b.name}</Text>
                  </TouchableOpacity>
                ))}

              {dropdownType === "service" &&
                selectedOrgData?.services?.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => {
                      setSelectedService(s.id);
                      setDropdownVisible(false);
                    }}
                    className="p-3 border-b border-gray-100"
                  >
                    <Text className="text-gray-800">{s.name}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
};

export default JoinQueue;
