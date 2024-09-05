import { View, StyleSheet } from "react-native";
import { ConnectButton } from "./sign-in-ui";

export function SignInFeature() {
  return (
    <>
      <View style={styles.buttonGroup}>
        <ConnectButton />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    marginTop: 16,
    flexDirection: "row",
  },
});
