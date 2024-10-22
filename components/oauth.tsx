import { View, Text, Image, Alert } from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";

import { icons } from "@/constants";

import { googleOAuth } from "@/lib/auth";

import CustomButton from "./custom-button";
import { router } from "expo-router";

const OAuth = () => {
  // Clerk OAuth, login com GoogleProvider
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = useCallback(async () => {
    try {
      // https://youtu.be/kmy_YNhl0mw?t=18717
      const result = await googleOAuth(startOAuthFlow);

      // https://youtu.be/kmy_YNhl0mw?t=18984
      if (result.code === "session_exists" || result.code === "success") {
        router.push("/(root)/(tabs)/home");
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton
        title="Log In with Google"
        className="mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;
