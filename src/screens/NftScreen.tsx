import { useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import { Button, Text } from "react-native-paper";
import {
  CameraType,
  ImagePickerAsset,
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { alertAndLog } from "../utils/functions";
import { saveToLibraryAsync } from "expo-media-library";
import { useNftUtils } from "../utils/useNftUtils";

export default function NftScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [image, setImage] = useState<ImagePickerAsset | null>(null);

  const { createNFT } = useNftUtils();

  const requestPermissions = async () => {
    const { status: mediaLibraryPermissionStatus } =
      await requestMediaLibraryPermissionsAsync();

    if (mediaLibraryPermissionStatus !== "granted") {
      alertAndLog(
        "Camera roll access denied",
        "Sorry, we need camera roll permissions to make this work!"
      );

      return false;
    }

    const { status: cameraPermissionStatus } =
      await requestCameraPermissionsAsync();

    if (cameraPermissionStatus !== "granted") {
      alertAndLog(
        "Camera access denied",
        "Sorry, we need camera permissions to make this work!"
      );

      return false;
    }

    return true;
  };

  const pickImageFromGallery = async () => {
    setIsLoading(true);

    const permissionsGranted = await requestPermissions();

    if (!permissionsGranted) {
      setIsLoading(false);
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }

    setIsLoading(false);
  };

  const captureImage = async () => {
    setIsLoading(true);

    const permissionsGranted = await requestPermissions();

    if (!permissionsGranted) {
      setIsLoading(false);
      return;
    }

    const result = await launchCameraAsync({
      cameraType: CameraType.back,
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);

      if (image) {
        await saveToLibraryAsync(image.uri);

        alertAndLog(
          "Image saved",
          "The image has been saved to your photo album."
        );
      }
    }

    setIsLoading(false);
  };

  const handleCreateNFT = async () => {
    setIsLoading(true);

    if (image) {
      await createNFT(image);
    }

    setIsLoading(false);
  };

  // const saveImage = async () => {
  //   setIsLoading(true);

  //   if (image) {
  //     await saveToLibraryAsync(image.uri);

  //     alertAndLog(
  //       "Image saved",
  //       "The image has been saved to your photo album."
  //     );
  //   }

  //   setIsLoading(false);
  // };

  const clearImage = () => {
    setImage(null);
  };

  return (
    <View style={styles.container}>
      {image ? (
        <>
          <Image source={{ uri: image.uri }} style={styles.image} />

          <Button
            mode="contained"
            loading={isLoading}
            onPress={handleCreateNFT}
            disabled={isLoading}
          >
            Create NFT
          </Button>

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
