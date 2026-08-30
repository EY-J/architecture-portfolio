import {
  ArchitectureModelError,
  type ResolvedModelSource,
} from "./modelTypes";

export function toArchitectureModelError(
  source: ResolvedModelSource,
  error: unknown,
) {
  const message = error instanceof Error ? error.message : String(error);
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("404") || normalizedMessage.includes("not found")) {
    return new ArchitectureModelError({
      code: "not-found",
      message: `Model file was not found: ${source.src}. ${message}`,
      publicMessage: "The configured 3D model file could not be found.",
      source,
      cause: error,
    });
  }

  if (
    normalizedMessage.includes("fetch") ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("status")
  ) {
    return new ArchitectureModelError({
      code: "network",
      message: `Model request failed for ${source.src}. ${message}`,
      publicMessage: "The 3D model could not be downloaded.",
      source,
      cause: error,
    });
  }

  const isFbx = source.format === "fbx";
  return new ArchitectureModelError({
    code: isFbx ? "parse-fbx" : "parse-gltf",
    message: `${source.format.toUpperCase()} parsing failed for ${source.src}. ${message}`,
    publicMessage: isFbx
      ? "The FBX model could not be parsed." :"The GLTF model could not be parsed.",
    source,
    cause: error,
  });
}
