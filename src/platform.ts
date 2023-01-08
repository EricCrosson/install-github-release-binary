import type { TargetTriple } from "./types";

function architectureLabel(arch: string): string {
  switch (arch) {
    case "arm64":
      return "aarch64";
    case "x64":
      return "x86_64";
    default:
      throw new Error(
        `Unsupported architecture ${arch} -- only aarch64 and x86_64 currently supported`
      );
  }
}

type PlatformDuple =
  | { vendor: "apple"; operatingSystem: "darwin" }
  | { vendor: "unknown"; operatingSystem: "linux-musl" };

function platformLabel(platform: NodeJS.Platform): PlatformDuple {
  switch (platform) {
    case "darwin":
      return {
        vendor: "apple",
        operatingSystem: "darwin",
      };
    case "linux":
      return {
        vendor: "unknown",
        operatingSystem: "linux-musl",
      };
    default:
      throw new Error(
        `Unsupported platform ${platform} -- only darwin and linux currently supported`
      );
  }
}

export function getTargetTriple(
  arch: string,
  platform: NodeJS.Platform
): TargetTriple {
  const architecture = architectureLabel(arch);
  const { vendor, operatingSystem } = platformLabel(platform);
  return `${architecture}-${vendor}-${operatingSystem}` as TargetTriple;
}
