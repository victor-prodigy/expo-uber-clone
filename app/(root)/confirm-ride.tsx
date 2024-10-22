import { FlatList, Text, View } from "react-native";
import { router } from "expo-router";

import { useDriverStore } from "@/store";

import DriverCard from "@/components/driver-card";
import RideLayout from "@/components/ride-layout";
import CustomButton from "@/components/custom-button";

const ConfirmRide = () => {
  // https://youtu.be/kmy_YNhl0mw?t=14394
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();

  return (
    <RideLayout title="Choose a Driver" snapPoints={["65%", "85%"]}>
      <FlatList
        data={drivers}
        renderItem={({ item }) => (
          <DriverCard
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(Number(item.id))}
            item={item}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            {/* Botão Select Ride */}
            <CustomButton
              title="Select Ride"
              onPress={() => router.push("/(root)/book-ride")}
            />
          </View>
        )}
      />
    </RideLayout>
  );
};

export default ConfirmRide;
