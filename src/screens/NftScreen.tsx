import { useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import { Button } from "react-native-paper";
import {
  CameraType,
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { alertAndLog } from "../utils/alertAndLog";
import { saveToLibraryAsync } from "expo-media-library";

export interface NFTSnapshot {
  uri: string;
  date: Date;
  latitude: number;
  longitude: number;
}

export default function NftScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any | null>(null);

  const requestPermissions = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
    }

    const cameraStatus = await requestCameraPermissionsAsync();
    if (cameraStatus.status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
    }
  };

  // Function to pick an image from the gallery
  const pickImageFromGallery = async () => {
    let result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      exif: true, // Request for metadata
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setMetadata(result.assets[0].exif);
    }
  };

  // Function to capture an image using the camera
  const captureImage = async () => {
    await requestPermissions();

    let result = await launchCameraAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      exif: true, // Request for metadata
      cameraType: CameraType.back,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setMetadata(result.assets[0].exif);
    }
  };

  // Function to print the metadata to the console
  const printMetadata = () => {
    if (metadata) {
      alertAndLog("Image Metadata", JSON.stringify(metadata));
    } else {
      alertAndLog("No metadata available", null);
    }
  };

  const saveImage = async () => {
    if (image) {
      await saveToLibraryAsync(image);
      alertAndLog(
        "Image saved",
        "The image has been saved to your photo album."
      );
    }
  };

  const clearImage = () => {
    setImage(null);
    setMetadata(null);
  };

  return (
    <View style={styles.container}>
      {image ? (
        <>
          <Image source={{ uri: image }} style={styles.image} />

          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={printMetadata}
              disabled={isLoading}
            >
              Print Metadata
            </Button>

            <Button
              mode="contained-tonal"
              onPress={saveImage}
              disabled={isLoading}
            >
              Save image
            </Button>
          </View>

          <Button mode="outlined" onPress={clearImage} disabled={isLoading}>
            Clear image
          </Button>
        </>
      ) : (
        <>
          <Button mode="contained" onPress={captureImage} disabled={isLoading}>
            Capture an Image
          </Button>

          <Button
            mode="contained"
            onPress={pickImageFromGallery}
            disabled={isLoading}
          >
            Load an Image from Gallery
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  buttonRow: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  image: {
    width: 300,
    height: 300,
  },
});
