import { useUserStore } from "@/store/user.store";
import { Redirect, Stack } from "expo-router";

const AuthLayout = () => {
  const user = useUserStore((u) => u.user);

  if (user) {
    return <Redirect href={"/(main)"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

export default AuthLayout;
