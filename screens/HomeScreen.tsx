import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <Text style={styles.appName}>tripr</Text>

      <View style={styles.heroWrap}>
        <Image
          source={require("../assets/hero.jpg")}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate('CreateTrip')}
        >
          <Text style={styles.primaryButtonText}>create a trip</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate('MyTrips')}
        >
          <Text style={styles.secondaryButtonText}>my trips</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },

  appName: {
    marginTop: 0,
    marginLeft: 28,
    fontSize: 64,
    fontWeight: 300,
    color: "#111111",
    letterSpacing: -1.2,
  },

  heroWrap: {
    marginTop: -4.9,
    marginBottom: 10,
    marginHorizontal: 28,
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#EDEBE6",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  buttonsContainer: {
    marginHorizontal: 28,
    marginBottom: 0,
  },

  primaryButton: {
    backgroundColor: "#89986D",
    height: 62,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  primaryButtonText: {
    color: "#FAF9F6",
    fontSize: 38,
    fontWeight: 300,
    letterSpacing: 0.6,
  },

  secondaryButton: {
    backgroundColor: "#C5D89D",
    height: 62,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#FAF9F6",
    fontSize: 38,
    fontWeight: 300,
    letterSpacing: 0.6,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
