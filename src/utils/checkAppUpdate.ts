import Constants from "expo-constants";
import api from "../services/api";

export const checkAppUpdate = async () => {
  try {
    const currentVersion = Constants.expoConfig?.version;

    const res = await api.get("/app/version");

    const { latestVersion, minSupportedVersion, forceUpdate } = res.data;

    if (currentVersion === latestVersion) return null;

    return res.data;
  } catch (error) {
    return null;
  }
};
