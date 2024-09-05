import { useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import { Button } from "react-native-paper";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";

export interface NFTSnapshot {
  uri: string;
  date: Date;
  latitude: number;
  longitude: number;
}

export default function NftScreen() {
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
      allowsEditing: true,
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
      allowsEditing: true,
      quality: 1,
      exif: true, // Request for metadata
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setMetadata(result.assets[0].exif);
    }
  };

  // Function to print the metadata to the console
  const printMetadata = () => {
    if (metadata) {
      console.log("Image Metadata:", metadata);
    } else {
      console.log("No metadata available");
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

          <Button mode="contained" onPress={printMetadata}>
            Print Metadata
          </Button>

          <Button mode="outlined" onPress={clearImage}>
            Clear image
          </Button>
        </>
      ) : (
        <>
          <Button mode="contained" onPress={captureImage}>
            Capture Image
          </Button>

          <Button mode="outlined" onPress={pickImageFromGallery}>
            Load from Gallery
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
  image: {
    width: 300,
    height: 300,
  },
});
