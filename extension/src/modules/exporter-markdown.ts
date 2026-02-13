import type { CCDBlock, ExporterPluginV1 } from "../sdk/types";

function blockToMarkdown(block: CCDBlock): string {
  switch (block.type) {
    case "paragraph":
      return block.text;
    case "heading":
      return `${"#".repeat(Math.max(1, Math.min(6, block.level)))} ${block.text}`;
    case "quote":
      return `> ${block.text}`;
    case "code":
      return `\`\`\`${block.lang || ""}\n${block.text}\n\`\`\``;
    case "table": {
      if (!block.rows.length) return "";
      const [header, ...body] = block.rows;
      const divider = header.map(() => "---");
      return [
        `| ${header.join(" | ")} |`,
        `| ${divider.join(" | ")} |`,
        ...body.map((row) => `| ${row.join(" | ")} |`)
      ].join("\n");
    }
    case "math":
      return `$$${block.latex}$$`;
    case "image":
      return `![${block.alt || "image"}](${block.assetId})`;
    default:
      return "";
  }
}

export const exporterMarkdown: ExporterPluginV1 = {
  id: "exporter-markdown",
  name: "Markdown",
  version: "1.0.0",
  coreApiVersion: "1.x",
  type: "export",
  permissionsNeeded: ["downloads"],
  async render(ccd) {
    const lines: string[] = [];
    for (const message of ccd.messages) {
      lines.push(`## ${message.role.toUpperCase()}`);
      for (const block of message.blocks) lines.push(blockToMarkdown(block));
      lines.push("");
    }
    return {
      kind: "download",
      filename: `chat-export-${Date.now()}.md`,
      mime: "text/markdown",
      text: lines.join("\n")
    };
  }
};
