let supported: boolean | undefined;
export function supportsWebGL() {
  if (supported !== undefined) return supported;
  try {
    const context = document.createElement("canvas").getContext("webgl2");
    supported = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch { supported = false; }
  return supported;
}
