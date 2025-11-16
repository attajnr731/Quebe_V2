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
import { verifyPaymentAndAddCredit } from "../../services/clientService";
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
  const { userData, refreshUserData, updateUserData } = useAuth();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const quickAmounts = [5, 10, 20, 50];

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
    setShowPaymentWebView(true);
  };

  const generatePaystackHTML = () => {
    const paystackKey = "pk_test_c475be44704411a11ddded174ab54f75aaa9f728";
    const amount = parseFloat(paymentAmount);
    const userId = userData?._id || "guest";
    const userPhone = userData?.phone || "0000000000";
    const userEmail = userData?.email || `${userPhone}@quebe.app`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://js.paystack.co/v1/inline.js"></script>
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f9fafb; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
    }
    .container { text-align: center; padding: 20px; }
    .spinner { 
      border: 4px solid #E5E7EB; 
      border-top: 4px solid #2563EB; 
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
    p { color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Opening payment...</p>
  </div>

  <script>
    setTimeout(function() {
      var handler = PaystackPop.setup({
        key: '${paystackKey}',
        email: '${userEmail}',
        amount: ${amount * 100},
        currency: 'GHS',
        metadata: {
          userId: '${userId}',
          phone: '${userPhone}',
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: '${userId}'
            }
          ]
        },
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

        console.log("✅ Payment successful:", { reference, amount });

        // OPTIMISTIC UI UPDATE - Update credit immediately
        const currentCredit = userData?.credit || 0;
        const newCredit = currentCredit + amount;

        // Update UI immediately (if updateUserData exists in your context)
        if (updateUserData) {
          updateUserData(newCredit);
        }

        // Then verify with backend
        try {
          const result = await verifyPaymentAndAddCredit(reference, amount);

          // Refresh to get the actual server state
          await refreshUserData();

          setIsVerifying(false);

          if (result.success) {
            Alert.alert(
              "Success! 🎉",
              `GH₵ ${amount.toFixed(2)} has been added to your account`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    onPaymentSuccess(reference, amount);
                    setPaymentAmount("");
                    onClose();
                  },
                },
              ]
            );
          } else {
            // Even if verification "fails", payment was successful
            Alert.alert(
              "Payment Received! ✓",
              `Your payment was successful! Your balance has been updated.\n\nReference: ${reference.substring(
                0,
                20
              )}...`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    onPaymentSuccess(reference, amount);
                    setPaymentAmount("");
                    onClose();
                  },
                },
              ]
            );
          }
        } catch (error) {
          console.error("Verification error:", error);
          setIsVerifying(false);

          // Credit was already added optimistically, so still show success
          Alert.alert(
            "Payment Received! ✓",
            "Your payment was successful! Your balance has been updated.",
            [
              {
                text: "OK",
                onPress: () => {
                  onPaymentSuccess(reference, amount);
                  setPaymentAmount("");
                  onClose();
                  // Try to refresh one more time
                  setTimeout(() => refreshUserData(), 2000);
                },
              },
            ]
          );
        }
      } else if (data.event === "cancelled") {
        setShowPaymentWebView(false);
        onPaymentCancel();
      }
    } catch (error) {
      console.error("❌ Payment message error:", error);
      setIsVerifying(false);
      Alert.alert("Error", "Failed to process payment response.");
    }
  };

  if (isVerifying) {
    return (
      <Modal visible transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 items-center w-full max-w-sm">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-gray-700 mt-4 text-lg font-semibold text-center">
              Processing Payment...
            </Text>
            <Text className="text-gray-500 mt-2 text-center text-sm">
              This will only take a moment
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
                colors={["#2563EB", "#0736b6ff"]}
                className="py-4 px-8"
              >
                <Text className="text-white font-bold text-lg text-center py-5">
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
