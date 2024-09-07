import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { Text } from "react-native-paper";
import { Section } from "../Section";
import { useAuthorization } from "../utils/useAuthorization";
import { AccountDetailFeature } from "../components/account/account-detail-feature";
import { SignInFeature } from "../components/sign-in/sign-in-feature";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useConnection } from "../utils/ConnectionProvider";

export function HomeScreen() {
  const { selectedAccount } = useAuthorization();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!selectedAccount) {
      return;
    }

    setRefreshing(true);

    queryClient.invalidateQueries({
      queryKey: [
        "get-token-accounts",
        {
          endpoint: connection.rpcEndpoint,
          address: selectedAccount.publicKey,
        },
      ],
    });

    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      style={styles.screenContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
    </ScrollView>
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
