import { FC, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export const Section: FC<{
  children?: ReactNode;
  description?: string;
  title?: string;
}> = ({ children, description, title }) => {
  return (
    <View>
      {title ? (
        <Text style={styles.titleText} variant="headlineMedium">
          {title}
        </Text>
      ) : null}

      {description ? <Text variant="bodyMedium">{description}</Text> : null}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  titleText: {
    fontWeight: "bold",
  },
  childrenContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
});
