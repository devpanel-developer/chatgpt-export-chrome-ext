import type { CanonicalChatDocumentV1, ExporterPluginV1 } from "./types";

export function validateCCD(ccd: CanonicalChatDocumentV1): string[] {
  const errors: string[] = [];
  if (!ccd.meta.url) errors.push("meta.url is required");
  if (!ccd.messages.length) errors.push("messages must not be empty");
  return errors;
}

export function validatePlugin(plugin: ExporterPluginV1): string[] {
  const errors: string[] = [];
  if (!plugin.id) errors.push("plugin.id is required");
  if (plugin.coreApiVersion !== "1.x") {
    errors.push("plugin.coreApiVersion must be 1.x");
  }
  return errors;
}
