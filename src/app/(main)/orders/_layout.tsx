import { Stack } from "expo-router";

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Commande",
        }}
      />

      <Stack.Screen
        name="client"
        options={{
          title: "Client",
        }}
      />

      <Stack.Screen
        name="loyalty"
        options={{
          title: "Fidélité",
        }}
      />

      <Stack.Screen
        name="preview"
        options={{
          title: "Aperçu",
        }}
      />

      <Stack.Screen
        name="invoice"
        options={{
          title: "Facture",
        }}
      />
    </Stack>
  );
}
