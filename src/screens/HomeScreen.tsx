import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Section } from "../Section";
import { useAuthorization } from "../utils/useAuthorization";
import { AccountDetailFeature } from "../components/account/account-detail-feature";
import { SignInFeature } from "../components/sign-in/sign-in-feature";

export function HomeScreen() {
  const { selectedAccount } = useAuthorization();

  return (
    <View style={styles.screenContainer}>
      <Text
        style={{ fontWeight: "bold", textAlign: "center" }}
        variant="displaySmall"
      >
        Mintpix
      </Text>
      {selectedAccount ? (
        <AccountDetailFeature />
      ) : (
        <View style={styles.connectionScreenContainer}>
          <Section
            title="1. Connect a wallet"
            description="Connect to your wallet app."
          />

          <Section
            title="2. Airdrop SOL"
            description="Airdrop 1 SOL if you need it."
          />

          <Section
            title="3. Mint NFT"
            description="Once your wallet is connected create an NFT by loading an image from your gallery or capturing a new image."
          />

          <SignInFeature />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    padding: 16,
    flex: 1,
  },
  connectionScreenContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    marginTop: 24,
  },
  buttonGroup: {
    flexDirection: "column",
    paddingVertical: 4,
  },
});
