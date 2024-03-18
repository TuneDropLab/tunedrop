import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import * as Sentry from "@sentry/react-native";


Sentry.init({
  dsn: "https://cd7bf1148cfa1fe20a662190408cab95@o4506932229636096.ingest.us.sentry.io/4506932245168128",
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});


function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Button
        title="Press me"
        onPress={() => {
          throw new Error("Hello, again, Sentry!");
        }}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Sentry.wrap(App);
