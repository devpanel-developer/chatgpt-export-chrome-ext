import { getModuleById } from "../modules";
import type { ExportResult } from "../sdk/types";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "RUN_MODULE") return;

  void run(message.moduleId, message.ccd)
    .then((result) => sendResponse({ ok: true, message: summarize(result), result }))
    .catch((error) => sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }));

  return true;
});

async function run(moduleId: string, ccd: any): Promise<ExportResult> {
  const plugin = getModuleById(moduleId);
  if (!plugin) throw new Error(`Unknown module: ${moduleId}`);

  const result = await plugin.render(ccd, {}, { localOnlyMode: false });
  if (result.kind === "download") {
    const blob = new Blob([result.text || ""], { type: result.mime || "text/plain" });
    const url = URL.createObjectURL(blob);
    await chrome.downloads.download({
      url,
      filename: result.filename || "chat-export.txt",
      saveAs: true
    });
  }

  if (result.kind === "openTab" && result.openUrl) {
    await chrome.tabs.create({ url: result.openUrl });
  }

  return result;
}

function summarize(result: ExportResult): string {
  if (result.kind === "publish") return result.publishResult?.displayUrl || "Published";
  if (result.kind === "download") return result.filename || "Downloaded";
  return result.kind;
}
