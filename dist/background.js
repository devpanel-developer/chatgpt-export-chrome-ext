const modules = {
  "exporter-json": {
    async render(ccd) {
      return { kind: "download", filename: `chat-export-${Date.now()}.json`, mime: "application/json", text: JSON.stringify(ccd, null, 2) };
    }
  },
  "exporter-markdown": {
    async render(ccd) {
      const lines = [];
      for (const message of ccd.messages) {
        lines.push(`## ${message.role.toUpperCase()}`);
        for (const block of message.blocks) {
          if (block.type === "paragraph") lines.push(block.text);
          else if (block.type === "heading") lines.push(`${"#".repeat(block.level)} ${block.text}`);
          else if (block.type === "code") lines.push(`\`\`\`${block.lang || ""}\n${block.text}\n\`\`\``);
          else if (block.type === "quote") lines.push(`> ${block.text}`);
          else if (block.type === "table" && block.rows.length) {
            const [header, ...body] = block.rows;
            lines.push(`| ${header.join(" | ")} |`);
            lines.push(`| ${header.map(() => "---").join(" | ")} |`);
            body.forEach((r) => lines.push(`| ${r.join(" | ")} |`));
          }
        }
      }
      return { kind: "download", filename: `chat-export-${Date.now()}.md`, mime: "text/markdown", text: lines.join("\n") };
    }
  },
  "publisher-gdocs": {
    async render(ccd) {
      return {
        kind: "publish",
        publishResult: { displayUrl: "https://docs.google.com", id: "token-required" },
        text: `Configure OAuth token in source build to publish ${ccd.messages.length} messages.`
      };
    }
  }
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "RUN_MODULE") return;
  (async () => {
    const plugin = modules[message.moduleId];
    if (!plugin) throw new Error("Unknown module");
    const result = await plugin.render(message.ccd);
    if (result.kind === "download") {
      const url = URL.createObjectURL(new Blob([result.text || ""], { type: result.mime || "text/plain" }));
      await chrome.downloads.download({ url, filename: result.filename || "chat-export.txt", saveAs: true });
    }
    sendResponse({ ok: true, message: result.filename || result.publishResult?.displayUrl || result.kind });
  })().catch((error) => sendResponse({ ok: false, error: error.message || String(error) }));
  return true;
});
