// src/components/skeletons/SkeletonJoinQueue.tsx
import React from "react";
import { View, Animated, Dimensions, StyleSheet } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.65;

const Shimmer = ({ width = "100%", height = 20, style }: any) => {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        { backgroundColor: "#E5E7EB", borderRadius: 8, overflow: "hidden" },
        { width, height },
        style,
      ]}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(255,255,255,0.8)",
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

export const SkeletonJoinQueue = ({
  step,
}: {
  step: "org" | "branch" | "review";
}) => {
  return (
    <View className="bg-white rounded-t-2xl" style={{ height: MODAL_HEIGHT }}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
        <View className="w-5" />
        <Shimmer width={100} height={20} />
        <Shimmer width={20} height={20} />
      </View>

      <View className="flex-1 px-4 pt-3">
        {step === "org" && <SkeletonOrgStep />}
        {step === "branch" && <SkeletonBranchStep />}
        {step === "review" && <SkeletonReviewStep />}
      </View>
    </View>
  );
};

const SkeletonOrgStep = () => (
  <>
    <Shimmer height={48} style={{ marginBottom: 12 }} />
    {Array.from({ length: 5 }).map((_, i) => (
      <View
        key={i}
        className="flex-row items-center mb-3 border border-gray-200 rounded-lg p-3 bg-white"
      >
        <Shimmer width={36} height={36} style={{ borderRadius: 18 }} />
        <View className="ml-3 flex-1">
          <Shimmer height={16} style={{ marginBottom: 6 }} />
          <Shimmer width={50} height={12} />
        </View>
        <Shimmer width={20} height={20} />
      </View>
    ))}
  </>
);

const SkeletonBranchStep = () => (
  <>
    <Shimmer width={120} height={20} style={{ marginBottom: 12 }} />
    {Array.from({ length: 4 }).map((_, i) => (
      <View
        key={i}
        className={`border rounded-lg p-3 mb-2 ${
          i === 0 ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
      >
        <Shimmer height={18} />
      </View>
    ))}
  </>
);

const SkeletonReviewStep = () => (
  <>
    <Shimmer width={80} height={20} style={{ marginBottom: 12 }} />
    <View className="bg-gray-50 rounded-lg p-3 mb-3">
      <Shimmer width={80} height={14} style={{ marginBottom: 6 }} />
      <Shimmer height={18} />
    </View>
    <View className="bg-gray-50 rounded-lg p-3">
      <Shimmer width={60} height={14} style={{ marginBottom: 6 }} />
      <Shimmer height={18} />
    </View>
  </>
);
