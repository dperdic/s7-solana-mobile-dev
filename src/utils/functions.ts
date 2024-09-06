import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  LocationAccuracy,
  LocationObjectCoords,
} from "expo-location";
import { Alert } from "react-native";

export const getLocation = async (): Promise<LocationObjectCoords | null> => {
  const { status } = await requestForegroundPermissionsAsync();

  if (status !== "granted") {
    alertAndLog(
      "Location access denied",
      "Permission to access location was denied, NFT minting requires latitude and longitude for the metadata. Please enable location access."
    );

    return null;
  }

  const location = await getCurrentPositionAsync({
    accuracy: LocationAccuracy.Highest,
  });

  return location.coords;
};

export function alertAndLog(title: string, message: string) {
  setTimeout(async () => {
    Alert.alert(title, message, [{ text: "Ok", style: "cancel" }]);
  }, 100);

  console.log(title, "\n", message);
}
