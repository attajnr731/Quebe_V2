import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { mockQueues } from "../mock/queues";
import JoinQueue from "../modals/joinQueue";
import TopUpAmountModal from "./payment/TopUpAmountModal";
import PaystackWebView from "./payment/PaystackWebView";

const { width } = Dimensions.get("window");

// PAYSTACK CONFIG (move to .env in production!)
const PAYSTACK_PUBLIC_KEY = "pk_test_c475be44704411a11ddded174ab54f75aaa9f728";
const USER_EMAIL = "attajnr731@gmail.com";

const Home = () => {
  const router = useRouter();
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const handleNotifications = () => console.log("Go to notifications");
  const handleComplaint = () => console.log("Make a complaint");
  const handleJoinQueue = () => setShowJoinModal(true);

  const handleJoinQueueSubmit = (data: {
    orgId: string;
    branchId?: string;
    serviceId?: string;
    notifyAt?: number;
  }) => {
    console.log("Joining queue:", data);
    setShowJoinModal(false);
  };

  const handleTopUpCredit = () => {
    setPaymentAmount("");
    setShowAmountModal(true);
  };

  const handleProceedToPayment = () => {
    const amt = parseFloat(paymentAmount);
    if (!paymentAmount || isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }
    if (amt < 1) {
      Alert.alert("Minimum Amount", "Minimum top-up amount is GH₵ 1.00");
      return;
    }
    setShowAmountModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (reference: string) => {
    Alert.alert(
      "Success!",
      `GH₵ ${parseFloat(paymentAmount).toFixed(
        2
      )} has been added to your account`,
      [{ text: "OK" }]
    );
    setShowPaymentModal(false);
    setPaymentAmount("");
    // TODO: verify on backend
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  const handleCloseAmountModal = () => {
    setShowAmountModal(false);
    setPaymentAmount("");
  };

  const userCredits = 10;

  const formatWait = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m > 0 ? `${m}m` : ""}`.trim();
  };

  // Quick amount buttons
  const quickAmounts = [5, 10, 20, 50, 100];

  // Generate HTML with embedded Paystack script - auto-opens payment
  const generatePaystackHTML = () => {
    const paystackKey = "pk_test_c475be44704411a11ddded174ab54f75aaa9f728";
    const email = "attajnr731@gmail.com";
    const amount = parseFloat(paymentAmount);
    const reference = `QUEUE_${Date.now()}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://js.paystack.co/v1/inline.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: #f9fafb;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .loading {
            text-align: center;
            color: #6B7280;
        }
        .spinner {
            border: 3px solid #E5E7EB;
            border-top: 3px solid #2563EB;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="loading">
        <div class="spinner"></div>
        <p>Opening payment...</p>
    </div>

    <script>
        function payWithPaystack() {
            var handler = PaystackPop.setup({
                key: '${paystackKey}',
                email: '${email}',
                amount: ${amount * 100}, // Amount in pesewas
                currency: 'GHS',
                ref: '${reference}',
                channels: ['card', 'mobile_money'],
                onClose: function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        event: 'cancelled'
                    }));
                },
                callback: function(response) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        event: 'success',
                        reference: response.reference,
                        transaction: response.transaction,
                        message: response.message
                    }));
                }
            });
            handler.openIframe();
        }
        
        // Auto-open payment immediately when page loads
        window.onload = function() {
            setTimeout(payWithPaystack, 100);
        };
    </script>
</body>
</html>
    `;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-6 pt-10 pb-4">
        <TouchableOpacity onPress={handleComplaint}>
          <MaterialIcons name="person-outline" size={28} color="#2563EB" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNotifications}>
          <MaterialIcons name="notifications-none" size={28} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 pt-4">
        {/* Join Queue Card */}
        <TouchableOpacity
          onPress={handleJoinQueue}
          activeOpacity={0.9}
          className="rounded-2xl overflow-hidden shadow-lg mb-6"
        >
          <LinearGradient
            colors={["#2563EB", "#1E3A8A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6"
          >
            <View
              className="absolute bg-blue-300 opacity-15 rounded-full"
              style={{
                width: width * 0.8,
                height: width * 0.8,
                top: -100,
                right: -150,
              }}
            />

            <View className="flex-row items-center justify-between mb-4 p-3">
              <View>
                <Text className="text-3xl font-bold text-white">
                  Join Queue
                </Text>
                <Text className="text-sm text-blue-100 mt-1">
                  Skip the line — get in instantly
                </Text>
              </View>
              <View className="bg-white/20 p-3 rounded-full">
                <MaterialIcons name="arrow-forward" size={28} color="white" />
              </View>
            </View>

            <View className="bg-white/15 rounded-xl p-4 mt-2">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-medium text-blue-100">
                    Your Credit Balance
                  </Text>
                  <Text className="text-2xl font-bold text-white mt-1">
                    {userCredits.toLocaleString()} ₡
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleTopUpCredit}
                  className="bg-white/25 p-3 rounded-full"
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Your Queues */}
        {mockQueues.length > 0 && (
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4 px-1">
              Your Queues
            </Text>

            <View className="space-y-3">
              {mockQueues.map((q) => (
                <ClassicQueueCard
                  key={q.id}
                  queue={q}
                  isSelected={selectedQueueId === q.id}
                  onPress={() =>
                    setSelectedQueueId(selectedQueueId === q.id ? null : q.id)
                  }
                  formatWait={formatWait}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Join Queue Modal */}
      <JoinQueue
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinQueue={handleJoinQueueSubmit}
      />

      {/* ---- AMOUNT INPUT MODAL ---- */}
      <TopUpAmountModal
        visible={showAmountModal}
        amount={paymentAmount}
        onAmountChange={setPaymentAmount}
        onClose={() => {
          setShowAmountModal(false);
          setPaymentAmount("");
        }}
        onProceed={handleProceedToPayment}
      />

      {/* ---- PAYSTACK WEBVIEW MODAL ---- */}
      <PaystackWebView
        visible={showPaymentModal}
        amount={paymentAmount}
        email={USER_EMAIL}
        publicKey={PAYSTACK_PUBLIC_KEY}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    </View>
  );
};

// Classic Queue Card Component
const ClassicQueueCard = ({ queue, isSelected, onPress, formatWait }: any) => {
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    if (isSelected) {
      height.value = withTiming(140, {
        duration: 250,
        easing: Easing.ease,
      });
      opacity.value = withDelay(80, withTiming(1, { duration: 200 }));
      rotate.value = withTiming(180, {
        duration: 250,
        easing: Easing.ease,
      });
    } else {
      height.value = withTiming(0, {
        duration: 250,
        easing: Easing.ease,
      });
      opacity.value = withTiming(0, { duration: 150 });
      rotate.value = withTiming(0, {
        duration: 250,
        easing: Easing.ease,
      });
    }
  }, [isSelected]);

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
      activeOpacity={0.8}
      className="bg-white rounded-xl p-4  border border-gray-200 my-1"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-lg bg-blue-50 items-center justify-center">
            <MaterialIcons name={queue.logo as any} size={24} color="#2563EB" />
          </View>

          <View className="ml-3 flex-1">
            <Text className="font-semibold text-gray-900 text-base">
              {queue.orgName}
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              Position {queue.position} of {queue.position + queue.peopleAhead}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="bg-blue-600 px-3 py-1.5 rounded-full mr-2">
            <Text className="text-white font-bold text-sm">
              #{queue.position}
            </Text>
          </View>
          <Animated.View style={chevronStyle}>
            <MaterialIcons name="expand-more" size={24} color="#9CA3AF" />
          </Animated.View>
        </View>
      </View>

      <Animated.View style={expandedStyle}>
        <View className="my-4 pt-4 border-t border-gray-100">
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">People Ahead</Text>
              <Text className="text-base font-semibold text-gray-900">
                {queue.peopleAhead}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Estimated Wait</Text>
              <Text className="text-base font-semibold text-blue-600">
                {formatWait(queue.estimatedWaitMin)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Avg. Time</Text>
              <Text className="text-base font-semibold text-gray-900">
                {queue.avgServiceTimeMin}m
              </Text>
            </View>
          </View>

          <View className="mt-4">
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: `${Math.min(
                    (queue.position / (queue.position + queue.peopleAhead)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default Home;
