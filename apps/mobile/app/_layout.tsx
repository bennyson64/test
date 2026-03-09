import '../global.css';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from "expo-status-bar";

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      {/* <SafeAreaProvider> */}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0f172a" },
            animation: "fade",
          }}
        />
      {/* </SafeAreaProvider> */}
    </>
  );
}
