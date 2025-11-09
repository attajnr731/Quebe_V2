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
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("");
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
    const email = userData?.email || "user@example.com";
    const amount = parseFloat(paymentAmount);
    // Don't pre-generate reference - let Paystack generate it
    // We'll use the reference from the callback response

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
      .loading { text-align: center; color: #6B7280; }
      .spinner {
        border: 3px solid #E5E7EB;
        border-top: 3px solid #2563EB;
        border-radius: 50%;
        width: 40px; height: 40px;
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
          amount: ${amount * 100},
          currency: 'GHS',
          ref: '${reference}',
          channels: ['card', 'mobile_money'],
          onClose: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'cancelled' }));
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
      window.onload = function() { setTimeout(payWithPaystack, 100); };
    </script>
  </body>
</html>
    `;
  };

  const handlePaymentMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.event === "success") {
        setShowPaymentWebView(false);
        setIsVerifying(true);
        setVerificationStatus("Verifying payment with Paystack...");

        const amount = parseFloat(paymentAmount);

        console.log("Payment successful, starting verification:", {
          reference: data.reference,
          amount,
        });

        // STRATEGY: Try verification with exponential backoff
        // Sometimes Paystack webhooks arrive faster, sometimes verification API is faster
        const maxAttempts = 5;
        let verificationSuccessful = false;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          try {
            console.log(`Verification attempt ${attempt + 1}/${maxAttempts}`);
            setVerificationStatus(
              `Verifying payment... (${attempt + 1}/${maxAttempts})`
            );

            // Call your backend verification endpoint
            const result = await verifyPaymentAndAddCredit(
              data.reference,
              amount
            );

            console.log("Verification result:", result);

            if (result.success) {
              verificationSuccessful = true;

              // Update local user data
              if (result.client) {
                await AsyncStorage.setItem(
                  "userData",
                  JSON.stringify(result.client)
                );
                await refreshUserData();
              }

              setIsVerifying(false);
              setVerificationStatus("");

              Alert.alert(
                "Success! 🎉",
                `GH₵ ${amount.toFixed(2)} has been added to your account`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      onPaymentSuccess(data.reference, amount);
                      setPaymentAmount("");
                    },
                  },
                ]
              );

              break;
            } else {
              // If verification failed but it's not the last attempt, wait and retry
              if (attempt < maxAttempts - 1) {
                console.log(
                  `Verification failed, waiting before retry: ${result.message}`
                );
                // Exponential backoff: 2s, 4s, 8s, 16s
                const waitTime = Math.pow(2, attempt + 1) * 1000;
                await new Promise((resolve) => setTimeout(resolve, waitTime));
              } else {
                // Last attempt failed
                throw new Error(result.message || "Verification failed");
              }
            }
          } catch (error: any) {
            console.error(`Attempt ${attempt + 1} error:`, error);

            if (attempt === maxAttempts - 1) {
              // All attempts exhausted
              setIsVerifying(false);
              setVerificationStatus("");

              Alert.alert(
                "Payment Processing",
                "We couldn't verify your payment immediately, but don't worry! " +
                  "Your payment is being processed in the background. " +
                  "Please check your balance in a few minutes. " +
                  "If the credit doesn't appear within 5 minutes, please contact support.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      onClose();
                      setPaymentAmount("");
                    },
                  },
                ]
              );
            }
          }
        }

        if (!verificationSuccessful) {
          console.log(
            "Verification unsuccessful after all attempts, but payment may still process via webhook"
          );
        }
      } else if (data.event === "cancelled") {
        setShowPaymentWebView(false);
        onPaymentCancel();
        Alert.alert("Payment Cancelled", "You cancelled the payment.");
      }
    } catch (error) {
      console.error("Error handling payment message:", error);
      setIsVerifying(false);
      setVerificationStatus("");

      Alert.alert(
        "Error",
        "Something went wrong processing your payment. Please contact support if your account wasn't credited.",
        [{ text: "OK", onPress: onClose }]
      );
    }
  };

  if (isVerifying) {
    return (
      <Modal visible transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 items-center w-full max-w-sm">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-gray-700 mt-4 text-lg font-semibold text-center">
              {verificationStatus || "Verifying Payment..."}
            </Text>
            <Text className="text-gray-500 mt-2 text-center text-sm">
              Please wait while we confirm your transaction with Paystack
            </Text>
            <Text className="text-gray-400 mt-3 text-center text-xs">
              This may take up to 30 seconds
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
                    activeOpacity={0.7}
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
              activeOpacity={0.9}
              className="rounded-xl overflow-hidden shadow-md"
            >
              <LinearGradient
                colors={["#2563EB", "#0d38aeff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
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
            <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-gray-200 bg-white">
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
              style={{ flex: 1 }}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
            />
          </View>
        </Modal>
      )}
    </Modal>
  );
};

export default TopUpModal;
