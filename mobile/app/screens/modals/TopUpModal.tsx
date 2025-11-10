// mobile/app/screens/modals/TopUpModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import {
  initializePayment,
  verifyPaymentAndAddCredit,
} from "../../services/clientService";
import { useAuth } from "../../contexts/AuthContext";

interface TopUpModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (reference: string, amount: number) => void;
  onPaymentCancel: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const { userData, refreshUserData } = useAuth();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("");
  const [paymentData, setPaymentData] = useState<any>(null);
  const quickAmounts = [5, 10, 20, 50];

  const handleProceedToPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }
    if (amount < 1) {
      Alert.alert("Minimum Amount", "Minimum top-up amount is GH₵ 1.00");
      return;
    }

    setIsInitializing(true);

    // Initialize payment with backend
    const result = await initializePayment(amount);

    setIsInitializing(false);

    if (!result.success) {
      Alert.alert("Error", result.message || "Failed to initialize payment");
      return;
    }

    console.log("Payment initialized:", result.data);
    setPaymentData(result.data);
    setShowPaymentWebView(true);
  };

  const generatePaystackHTML = () => {
    const paystackKey = "pk_test_c475be44704411a11ddded174ab54f75aaa9f728";
    const amount = parseFloat(paymentAmount);

    if (!paymentData) return "";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://js.paystack.co/v1/inline.js"></script>
  <style>
    body { margin: 0; padding: 0; font-family: sans-serif; background: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .container { text-align: center; padding: 20px; }
    .spinner { border: 4px solid #E5E7EB; border-top: 4px solid #2563EB; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Opening Paystack...</p>
  </div>

  <script>
    setTimeout(function() {
      var handler = PaystackPop.setup({
        key: '${paystackKey}',
        access_code: '${paymentData.access_code}',
        onClose: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            event: 'cancelled' 
          }));
        },
        callback: function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            event: 'success',
            reference: response.reference || '${paymentData.reference}',
            amount: ${amount}
          }));
        }
      });
      handler.openIframe();
    }, 500);
  </script>
</body>
</html>
    `;
  };

  const handlePaymentMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.event === "success") {
        const { reference, amount } = data;
        setShowPaymentWebView(false);
        setIsVerifying(true);
        setVerificationStatus("Processing payment...");

        console.log("Paystack success:", { reference, amount });

        // Wait 2 seconds for Paystack to process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const maxAttempts = 5;
        let success = false;

        for (let i = 0; i < maxAttempts; i++) {
          try {
            setVerificationStatus(`Verifying... (${i + 1}/${maxAttempts})`);
            console.log(`Verification attempt ${i + 1}`);

            const result = await verifyPaymentAndAddCredit(reference, amount);

            if (result.success) {
              success = true;
              setIsVerifying(false);
              Alert.alert("Success!", "Credit added successfully!");
              refreshUserData();
              onPaymentSuccess(reference, amount);
              onClose();
              break;
            } else if (result.message?.includes("already")) {
              success = true;
              setIsVerifying(false);
              Alert.alert(
                "Already Credited",
                "This payment was already processed."
              );
              refreshUserData();
              onClose();
              break;
            }

            console.log("Verification result:", result);
          } catch (err: any) {
            console.log("Retry error:", err.message);
          }

          if (i < maxAttempts - 1) {
            const waitTime = 3000 * (i + 1); // 3s, 6s, 9s, 12s, 15s
            console.log(`Waiting ${waitTime / 1000}s before retry...`);
            await new Promise((r) => setTimeout(r, waitTime));
          }
        }

        if (!success) {
          setIsVerifying(false);
          Alert.alert(
            "Verification Delayed",
            "Payment received! Your credit will update shortly via webhook. Please refresh in 1-2 minutes.\n\nRef: " +
              reference,
            [
              {
                text: "OK",
                onPress: () => {
                  refreshUserData();
                  onClose();
                },
              },
            ]
          );
        }
      } else if (data.event === "cancelled") {
        setShowPaymentWebView(false);
        onPaymentCancel();
        Alert.alert("Cancelled", "Payment was cancelled.");
      }
    } catch (error) {
      console.error("Message error:", error);
      setIsVerifying(false);
      Alert.alert("Error", "Failed to process payment response.");
    }
  };

  // Loading states
  if (isInitializing) {
    return (
      <Modal visible transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 items-center w-full max-w-sm">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-gray-700 mt-4 text-lg font-semibold text-center">
              Preparing Payment...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (isVerifying) {
    return (
      <Modal visible transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 items-center w-full max-w-sm">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-gray-700 mt-4 text-lg font-semibold text-center">
              {verificationStatus}
            </Text>
            <Text className="text-gray-500 mt-2 text-center text-sm">
              Confirming with Paystack...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {!showPaymentWebView ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 bg-black/50 justify-center items-center"
        >
          <View className="bg-white rounded-3xl w-11/12 max-w-md p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-800">
                Top Up Credit
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

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

            <View className="mb-6">
              <Text className="text-sm text-gray-600 mb-3">Quick Select</Text>
              <View className="flex-row flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    onPress={() => setPaymentAmount(amount.toString())}
                    className="bg-gray-100 px-4 py-3 rounded-lg border border-gray-200"
                  >
                    <Text className="text-gray-800 font-semibold">
                      GH₵ {amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleProceedToPayment}
              className="rounded-xl overflow-hidden"
            >
              <LinearGradient
                colors={["#2563EB", "#1E3A8A"]}
                className="py-4 px-8"
              >
                <Text className="text-white font-bold text-lg text-center">
                  Continue to Payment
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <Modal visible animationType="slide">
          <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-gray-200">
              <View>
                <Text className="text-lg font-bold text-gray-800">Payment</Text>
                <Text className="text-sm text-gray-500">
                  GH₵ {parseFloat(paymentAmount).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowPaymentWebView(false);
                  setPaymentData(null);
                  onPaymentCancel();
                }}
              >
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <WebView
              originWhitelist={["*"]}
              source={{ html: generatePaystackHTML() }}
              onMessage={handlePaymentMessage}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              style={{ flex: 1 }}
            />
          </View>
        </Modal>
      )}
    </Modal>
  );
};

export default TopUpModal;
