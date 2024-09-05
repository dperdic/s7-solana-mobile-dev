import {
  getCurrentPositionAsync,
  LocationAccuracy,
  requestForegroundPermissionsAsync,
} from "expo-location";

export async function getCurrentLocation() {
  let { status } = await requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Permission to access location was denied");
    return null;
  }

  let location = await getCurrentPositionAsync({
    accuracy: LocationAccuracy.Highest,
  });
  return location.coords;
}
