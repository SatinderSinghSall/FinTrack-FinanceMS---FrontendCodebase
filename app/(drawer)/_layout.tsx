import { Drawer } from "expo-router/drawer";
import CustomDrawer from "@/src/components/CustomDrawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        overlayColor: "rgba(0,0,0,0.1)",
        drawerStyle: {
          width: 300,
          backgroundColor: "#ffffff",
        },
        sceneContainerStyle: {
          backgroundColor: "#ffffff",
        },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
