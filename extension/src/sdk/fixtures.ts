import type { CanonicalChatDocumentV1 } from "./types";

export const smallFixture: CanonicalChatDocumentV1 = {
  meta: {
    sourceApp: "chatgpt",
    url: "https://chatgpt.com/c/example",
    title: "Fixture Chat",
    capturedAtISO: new Date().toISOString(),
    selection: { scope: "all", messageIds: ["m1", "m2"] }
  },
  messages: [
    { id: "m1", role: "user", blocks: [{ type: "paragraph", text: "hello" }] },
    {
      id: "m2",
      role: "assistant",
      blocks: [
        { type: "heading", level: 2, text: "Response" },
        { type: "code", lang: "ts", text: "console.log('ok');" }
      ]
    }
  ],
  assets: [],
  annotations: { warnings: [], redactions: [] }
};
