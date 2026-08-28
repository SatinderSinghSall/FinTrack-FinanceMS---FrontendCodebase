import Constants from "expo-constants";
import api from "../services/api";

type AppVersionResponse = {
  latestVersion: string;
  minSupportedVersion: string;
  forceUpdate?: boolean;
  playStoreUrl: string;
  updateMessage?: string;
};

const compareVersions = (a: string, b: string): number => {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] ?? 0;
    const bPart = bParts[i] ?? 0;

    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }

  return 0;
};

export const checkAppUpdate = async () => {
  try {
    const currentVersion = Constants.expoConfig?.version;

    if (!currentVersion) {
      return null;
    }

    const res = await api.get<AppVersionResponse>("/app/version");

    const { latestVersion, minSupportedVersion, forceUpdate, playStoreUrl } =
      res.data;

    // Current version is below the minimum supported version.
    // This update must be forced.
    if (compareVersions(currentVersion, minSupportedVersion) < 0) {
      return {
        ...res.data,
        forceUpdate: true,
      };
    }

    // Current version is older than the latest version.
    // This is an optional update.
    if (compareVersions(currentVersion, latestVersion) < 0) {
      return {
        ...res.data,
        forceUpdate: forceUpdate ?? false,
      };
    }

    // Current version is up to date.
    return null;
  } catch (error) {
    console.error("Failed to check app update:", error);
    return null;
  }
};
