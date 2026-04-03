import { Drawer } from "expo-router/drawer";
import CustomDrawer from "@/src/components/CustomDrawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        overlayColor: "rgba(0,0,0,0.3)",
        drawerStyle: {
          width: 280,
        },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
