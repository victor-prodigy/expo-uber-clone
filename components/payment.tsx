import { useStripe } from "@stripe/stripe-react-native";
import { Alert, Image, Text } from "react-native";
import { useState } from "react";
import { useAuth } from "@clerk/clerk-expo";

import { fetchAPI } from "@/lib/fetch";

import { PaymentProps } from "@/types/type";

import { useLocationStore } from "@/store";

import CustomButton from "./custom-button";
import ReactNativeModal from "react-native-modal";
import { View } from "react-native";
import { images } from "@/constants";
import { router } from "expo-router";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { userId } = useAuth(); // Clerk

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [success, setSuccess] = useState(false); // NOTE: para estado do modal de success `Booking placed`

  // https://youtu.be/kmy_YNhl0mw?t=17681
  // OBS: no mundo real nao é preciso extrair esses dados de store ate porque sao dados estaticos, seria necessario a utilização da geolocalização dos usuarios, e dados de endereço do usuario que devera ser salvo no banco de dados
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Ryde Inc.",
      intentConfiguration: {
        mode: {
          // https://youtu.be/kmy_YNhl0mw?t=18325
          amount: parseInt(amount) * 100,
          currencyCode: "USD",
        },
        // https://youtu.be/kmy_YNhl0mw?t=15447
        // NOTE: [Stripe] para confirmar pagamento
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          intentCreationCallback
        ) => {
          const { paymentIntent, customer } = await fetchAPI(
            "/(api)/(stripe)/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email: email,
                amount,
                paymentMethodId: paymentMethod.id,
              }),
            }
          );

          if (paymentIntent.client_secret) {
            // NOTE: API pay+api.ts https://youtu.be/kmy_YNhl0mw?t=16366
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
              }),
            });

            // https://youtu.be/kmy_YNhl0mw?t=16436
            if (result.client_secret) {
              // NOTE: [API Route] criando ride
              await fetchAPI("/(api)/ride/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  // https://youtu.be/kmy_YNhl0mw?t=17720
                  origin_address: userAddress,
                  destination_address: destinationAddress,
                  origin_latitude: userLatitude,
                  origin_longitude: userLongitude,
                  destination_latitude: destinationLatitude,
                  destination_longitude: destinationLongitude,
                  ride_time: rideTime.toFixed(0),
                  fare_price: parseInt(amount) * 100,
                  payment_status: "paid",
                  driver_id: driverId,
                  user_id: userId,
                }),
              });

              // https://youtu.be/kmy_YNhl0mw?t=17836
              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },
      // https://youtu.be/kmy_YNhl0mw?t=17866
      // NOTE: para voltar assim que completar o pagamento
      returnURL: 'myapp"//book-ride',
    });
    if (error) {
      // handle error
      console.log(error);
    }
  };

  // https://youtu.be/kmy_YNhl0mw?t=15263
  // NOTE: [Stripe] função para abrir Sheet de Pagamento
  const openPaymentSheet = async () => {
    await initializePaymentSheet();

    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Ride booked
          </Text>

          <Text className="text-md text-general-200 font-JakartaMedium mt-3">
            Thank you for your booking. Your reservation has been placed. Please
            proceed with your trip!
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
