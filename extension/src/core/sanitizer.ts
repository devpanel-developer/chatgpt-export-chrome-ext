import type { CanonicalChatDocumentV1 } from "../sdk/types";

export interface SanitizeOptions {
  maskEmails: boolean;
  maskSecrets: boolean;
  removeImages: boolean;
}

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const TOKEN_REGEX = /(sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z\-_]{35}|ghp_[A-Za-z0-9]{36})/g;

export function sanitizeCCD(
  ccd: CanonicalChatDocumentV1,
  options: SanitizeOptions
): CanonicalChatDocumentV1 {
  const cloned = structuredClone(ccd);
  for (const message of cloned.messages) {
    for (const block of message.blocks) {
      if (block.type === "paragraph" || block.type === "quote" || block.type === "heading") {
        block.text = scrub(block.text, options);
      }
      if (block.type === "code") {
        block.text = scrub(block.text, options);
      }
    }
    if (options.removeImages) {
      message.blocks = message.blocks.filter((block) => block.type !== "image");
    }
  }
  return cloned;
}

function scrub(text: string, options: SanitizeOptions): string {
  let value = text;
  if (options.maskEmails) value = value.replace(EMAIL_REGEX, "[REDACTED_EMAIL]");
  if (options.maskSecrets) value = value.replace(TOKEN_REGEX, "[REDACTED_SECRET]");
  return value;
}
