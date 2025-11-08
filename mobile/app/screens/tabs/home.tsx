import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { mockQueues } from "../mock/queues";
import JoinQueue from "../modals/joinQueue";

const { width } = Dimensions.get("window");

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
    setShowAmountModal(true);
  };

  const handleProceedToPayment = () => {
    const amount = parseFloat(paymentAmount);

    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    if (amount < 1) {
      Alert.alert("Minimum Amount", "Minimum top-up amount is GH₵ 1.00");
      return;
    }

    setShowAmountModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (reference: string) => {
    console.log("Payment successful:", reference);
    Alert.alert(
      "Success!",
      `GH₵ ${parseFloat(paymentAmount).toFixed(
        2
      )} has been added to your account`,
      [{ text: "OK" }]
    );
    setShowPaymentModal(false);
    setPaymentAmount("");
    // TODO: Verify payment on backend and update user credits
  };

  const handlePaymentCancel = () => {
    console.log("Payment cancelled");
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
          className="rounded-2xl overflow-hidden mb-6"
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

      {/* Amount Input Modal */}
      <Modal
        visible={showAmountModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseAmountModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 bg-black/50 justify-center items-center"
        >
          <View className="bg-white rounded-3xl w-11/12 max-w-md p-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-800">
                Top Up Credit
              </Text>
              <TouchableOpacity onPress={handleCloseAmountModal}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View className="mb-6">
              <Text className="text-sm text-gray-600 mb-2">Enter Amount</Text>
              <View className="flex-row items-center border-2 border-blue-500 rounded-xl px-4 bg-blue-50">
                <Text className="text-2xl font-bold text-gray-700 mr-2">
                  GH₵
                </Text>
                <TextInput
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="flex-1 text-3xl font-bold text-gray-900 py-4"
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                />
              </View>
            </View>

            {/* Quick Amount Buttons */}
            <View className="mb-6">
              <Text className="text-sm text-gray-600 mb-3">Quick Select</Text>
              <View className="flex-row flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    onPress={() => setPaymentAmount(amount.toString())}
                    className="bg-gray-100 px-4 py-3 rounded-lg border border-gray-200"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-800 font-semibold">
                      GH₵ {amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleProceedToPayment}
              activeOpacity={0.9}
              className="rounded overflow-hidden shadow-md"
            >
              <LinearGradient
                colors={["#2563EB", "#0d38aeff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="py-4 px-8 flex-row justify-center items-center"
              >
                <Text className="text-white  font-bold text-xl tracking-wide text-center py-5">
                  Continue to Payment
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Payment Modal with WebView */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        onRequestClose={handlePaymentCancel}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-gray-200 bg-white">
            <View>
              <Text className="text-lg font-bold text-gray-800">Payment</Text>
              <Text className="text-sm text-gray-500">
                GH₵ {parseFloat(paymentAmount).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity onPress={handlePaymentCancel}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* WebView for Paystack */}
          <WebView
            originWhitelist={["*"]}
            source={{ html: generatePaystackHTML() }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);

                if (data.event === "success") {
                  handlePaymentSuccess(data.reference);
                } else if (data.event === "cancelled") {
                  handlePaymentCancel();
                }
              } catch (error) {
                console.error("Error parsing message:", error);
              }
            }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
          />
        </View>
      </Modal>
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
          {/* Queue Code */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xs text-gray-500 uppercase tracking-wide">
              Queue Code
            </Text>
            <View className="bg-blue-100 px-3 py-1.5 rounded-full">
              <Text className="text-sm text-blue-700 font-bold tracking-wider">
                {queue.queueCode}
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row justify-between mb-3">
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

          {/* Progress Bar */}
          <View className="mt-2">
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
