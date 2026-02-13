import type { CanonicalChatDocumentV1, CCDBlock } from "../sdk/types";

interface SelectionConfig {
  includeUser: boolean;
  includeAssistant: boolean;
  scope: "all" | "partial";
  selectedIds: Set<string>;
}

export function buildCCDFromDom(config: SelectionConfig): CanonicalChatDocumentV1 {
  const containers = Array.from(document.querySelectorAll<HTMLElement>("[data-message-author-role]"));
  const messages = containers
    .map((el, index) => {
      const role = el.getAttribute("data-message-author-role") === "user" ? "user" : "assistant";
      const id = el.dataset.messageId || `msg-${index}`;
      if (config.scope === "partial" && !config.selectedIds.has(id)) return null;
      if ((role === "user" && !config.includeUser) || (role === "assistant" && !config.includeAssistant)) {
        return null;
      }
      const blocks = parseBlocks(el);
      return { id, role, blocks };
    })
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return {
    meta: {
      sourceApp: "chatgpt",
      url: location.href,
      title: document.title,
      capturedAtISO: new Date().toISOString(),
      selection: { scope: config.scope, messageIds: messages.map((m) => m.id) }
    },
    messages,
    assets: [],
    annotations: { warnings: [], redactions: [] }
  };
}

function parseBlocks(root: HTMLElement): CCDBlock[] {
  const blocks: CCDBlock[] = [];
  root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,pre,blockquote,table").forEach((el) => {
    if (el.tagName === "P") blocks.push({ type: "paragraph", text: el.textContent?.trim() || "" });
    if (/H[1-6]/.test(el.tagName)) {
      blocks.push({
        type: "heading",
        level: Number(el.tagName[1]),
        text: el.textContent?.trim() || ""
      });
    }
    if (el.tagName === "PRE") blocks.push({ type: "code", text: el.textContent || "" });
    if (el.tagName === "BLOCKQUOTE") blocks.push({ type: "quote", text: el.textContent || "" });
    if (el.tagName === "TABLE") {
      const rows = Array.from(el.querySelectorAll("tr")).map((tr) =>
        Array.from(tr.querySelectorAll("th,td")).map((cell) => cell.textContent?.trim() || "")
      );
      blocks.push({ type: "table", rows });
    }
  });

  if (!blocks.length) {
    blocks.push({ type: "paragraph", text: root.textContent?.trim() || "" });
  }
  return blocks;
}
