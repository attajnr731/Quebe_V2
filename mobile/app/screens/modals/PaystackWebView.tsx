import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { WebView } from "react-native-webview";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  amount: string; // GHS amount (e.g. "25.50")
  email: string; // user email
  publicKey: string; // Paystack public key
  onSuccess: (reference: string) => void;
  onCancel: () => void;
};

const generatePaystackHTML = ({
  publicKey,
  email,
  amount,
  reference,
}: {
  publicKey: string;
  email: string;
  amount: number; // pesewas
  reference: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://js.paystack.co/v1/inline.js"></script>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .loading{text-align:center;color:#6B7280;}
    .spinner{border:3px solid #E5E7EB;border-top:3px solid #2563EB;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 16px;}
    @keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
  </style>
</head>
<body>
  <div class="loading"><div class="spinner"></div><p>Opening payment...</p></div>

  <script>
    function payWithPaystack(){
      var handler = PaystackPop.setup({
        key: '${publicKey}',
        email: '${email}',
        amount: ${amount},
        currency: 'GHS',
        ref: '${reference}',
        channels: ['card','mobile_money'],
        onClose: function(){ window.ReactNativeWebView.postMessage(JSON.stringify({event:'cancelled'})); },
        callback: function(response){
          window.ReactNativeWebView.postMessage(JSON.stringify({
            event:'success',
            reference: response.reference,
            transaction: response.transaction,
            message: response.message
          }));
        }
      });
      handler.openIframe();
    }
    window.onload = function(){ setTimeout(payWithPaystack,100); };
  </script>
</body>
</html>
`;

export default function PaystackWebView({
  visible,
  amount,
  email,
  publicKey,
  onSuccess,
  onCancel,
}: Props) {
  const amountPesewas = Math.round(parseFloat(amount) * 100);
  const reference = `QUEUE_${Date.now()}`;

  const html = generatePaystackHTML({
    publicKey,
    email,
    amount: amountPesewas,
    reference,
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-gray-200 bg-white">
          <View>
            <Text className="text-lg font-bold text-gray-800">Payment</Text>
            <Text className="text-sm text-gray-500">
              GH₵ {parseFloat(amount).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancel}>
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.event === "success") onSuccess(data.reference);
              else if (data.event === "cancelled") onCancel();
            } catch (e) {
              console.error(e);
            }
          }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          style={{ flex: 1 }}
        />
      </View>
    </Modal>
  );
}
