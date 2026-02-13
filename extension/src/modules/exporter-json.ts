import type { ExporterPluginV1 } from "../sdk/types";

export const exporterJson: ExporterPluginV1 = {
  id: "exporter-json",
  name: "CCD JSON",
  version: "1.0.0",
  coreApiVersion: "1.x",
  type: "export",
  permissionsNeeded: ["downloads"],
  async render(ccd) {
    return {
      kind: "download",
      filename: `chat-export-${Date.now()}.json`,
      mime: "application/json",
      text: JSON.stringify(ccd, null, 2)
    };
  }
};
